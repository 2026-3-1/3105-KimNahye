# P3 운영 Runbook — 배포/롤백/장애 대응 가이드

## 개요

이 문서는 Solving Meal 백엔드 운영 시 발생하는 배포, 롤백, 장애 상황에 대한 표준 대응 절차를 정의합니다.

---

## 1. 배포 절차

### 사전 조건
- Docker 및 Docker Compose가 설치된 서버 환경
- `.env.production` 파일이 서버에 존재
- 최신 이미지가 컨테이너 레지스트리에 푸시된 상태

### 배포 명령어

```bash
# 1. 최신 이미지 Pull
docker compose pull

# 2. 서비스 재시작 (무중단 롤링 업데이트)
docker compose up -d

# 3. 배포 상태 확인
docker compose ps

# 4. 헬스체크 확인
curl -f http://localhost:3000/api/v1/health
```

### 배포 후 확인 항목
- [ ] 헬스체크 엔드포인트 정상 응답 (`200 OK`)
- [ ] 로그에 에러 없음 (`docker compose logs -f backend --tail=50`)
- [ ] DB 마이그레이션 완료 확인
- [ ] Redis 연결 정상

---

## 2. 롤백 방법

### 이전 버전으로 즉시 롤백

```bash
# 1. 서비스 중지
docker compose down

# 2. 이전 이미지 태그로 복원
docker tag solving-meal-backend:<이전_태그> solving-meal-backend:latest
# 예: docker tag solving-meal-backend:v1.2.3 solving-meal-backend:latest

# 3. 서비스 재시작
docker compose up -d

# 4. 롤백 확인
curl -f http://localhost:3000/api/v1/health
```

### DB 마이그레이션 롤백이 필요한 경우

```bash
# TypeORM 마이그레이션 되돌리기
docker compose exec backend npm run typeorm migration:revert

# 마이그레이션 상태 확인
docker compose exec backend npm run typeorm migration:show
```

> **주의**: 데이터 손실 가능성이 있는 롤백은 반드시 DB 백업 후 진행

---

## 3. 헬스체크

### 엔드포인트

```
GET /api/v1/health
```

### 정상 응답 예시

```json
{
  "status": "ok",
  "timestamp": "2026-06-02T10:00:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### 모니터링 주기
- 운영 환경: 30초 간격 자동 헬스체크 (Docker `HEALTHCHECK` 설정)
- 장애 감지 시: Slack 알림 발송

---

## 4. 로그 확인

### 실시간 로그

```bash
# 백엔드 전체 로그
docker compose logs -f backend

# 최근 100줄만 확인
docker compose logs --tail=100 backend

# 에러 로그만 필터링
docker compose logs backend 2>&1 | grep -i "error\|exception\|critical"
```

### 파일 기반 로그

로그 파일은 `logs/` 디렉토리에 저장됩니다.

```
logs/
├── application-YYYY-MM-DD.log   # 전체 로그 (Winston 로테이션)
├── error-YYYY-MM-DD.log         # 에러 레벨 로그
└── access-YYYY-MM-DD.log        # HTTP 접근 로그
```

```bash
# 오늘 에러 로그 확인
cat logs/error-$(date +%Y-%m-%d).log

# 특정 요청 ID 추적
grep "requestId: abc123" logs/application-2026-06-02.log
```

---

## 5. DB 장애 대응

### 증상
- `TypeORM` 연결 실패 에러 로그
- 헬스체크에서 `"database": "disconnected"` 응답

### 대응 절차

```bash
# 1. Connection Pool 상태 점검
docker compose exec backend npm run db:status

# 2. PostgreSQL 컨테이너 상태 확인
docker compose ps db
docker compose logs db --tail=50

# 3. DB 재시작 (데이터 유실 없음)
docker compose restart db

# 4. 재시작 후 연결 확인 (약 10초 대기)
docker compose exec db pg_isready -U $POSTGRES_USER

# 5. 마이그레이션 상태 확인 및 재실행 (필요 시)
docker compose exec backend npm run typeorm migration:run

# 6. 백엔드 재시작으로 Connection Pool 초기화
docker compose restart backend
```

### Connection Pool 설정 (`typeorm.config.ts`)
```
extra.max: 10        # 최대 연결 수
extra.idleTimeoutMillis: 30000
extra.connectionTimeoutMillis: 2000
```

---

## 6. Redis 장애 대응

### 증상
- `Redis connection refused` 에러 로그
- 캐시 히트율 0% (응답 속도 저하 가능)

### 중요: Redis 장애는 서비스 운영에 직접 영향을 주지 않습니다

Redis는 캐싱 및 토큰 블랙리스트 용도로 사용됩니다. 장애 시:
- **캐시 장애**: 자동으로 DB에서 직접 조회 (Fallback 동작)
- **토큰 블랙리스트 장애**: 로그아웃된 토큰이 일시적으로 유효할 수 있음 (보안 주의)

### 대응 절차

```bash
# 1. Redis 컨테이너 상태 확인
docker compose ps redis
docker compose logs redis --tail=30

# 2. Redis 재시작
docker compose restart redis

# 3. 연결 확인
docker compose exec redis redis-cli ping
# 응답: PONG

# 4. 캐시 초기화 (필요 시)
docker compose exec redis redis-cli FLUSHALL
```

---

## 7. 외부 API 장애 대응

### Toss Payments API 장애

**증상**: 결제 요청 시 `503` 또는 타임아웃

```bash
# Toss Payments 상태 페이지 확인
# https://status.tosspayments.com

# 로그에서 Toss API 에러 확인
grep "TossPayments" logs/error-$(date +%Y-%m-%d).log

# Retry 로직 동작 확인 (로그에서 retry 키워드 검색)
grep "retry" logs/application-$(date +%Y-%m-%d).log
```

**Fallback 처리**:
- 결제 실패 시 사용자에게 명확한 에러 메시지 반환
- 결제 대기(PENDING) 상태로 저장 후 Webhook 수신 시 업데이트
- 관리자에게 Slack 알림 발송

### SMTP(이메일) 장애

**증상**: 이메일 발송 실패 로그

```bash
# SMTP 에러 로그 확인
grep "SMTP\|nodemailer\|email" logs/error-$(date +%Y-%m-%d).log
```

**Fallback 처리**:
- 이메일 발송은 비동기 처리로 서비스 본 기능에 영향 없음
- 발송 실패 시 재시도 큐에 추가 (BullMQ 스케줄러)
- 3회 실패 시 DLQ(Dead Letter Queue)로 이동 및 관리자 알림

---

## 8. 긴급 연락처

| 역할 | 담당자 | 연락처 |
|------|--------|--------|
| 백엔드 담당 | 개발팀 | Slack #solving-meal-alert |
| DB 관리 | 인프라팀 | Slack #infra-alert |
| 결제 이슈 | Toss Payments 고객사 지원 | 1544-7772 |

---

*최종 수정일: 2026-06-02*
