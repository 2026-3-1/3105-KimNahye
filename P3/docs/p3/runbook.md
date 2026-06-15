# P3 Runbook — Solving Meal 운영 가이드

## 모니터링 엔드포인트

| 엔드포인트 | 설명 | 정상 응답 |
|---|---|---|
| `GET /api/v1/health` | DB 연결 헬스체크 | `{ status: "ok" }` |
| `GET /api/v1/metrics` | Prometheus 메트릭 | text/plain 메트릭 |

---

## 장애 시나리오별 대응

### 시나리오 1 — 토스페이먼츠 API 다운

**증상**: `POST /api/v1/payments/confirm` 에서 500 응답 또는 타임아웃

**대응 절차**:
1. 토스페이먼츠 상태 페이지 확인: https://status.tosspayments.com
2. 서버 에러 로그 확인: `docker compose logs backend | grep PaymentService`
3. 재시도 정책(`withRetry`)이 3회 시도 후 실패했는지 확인
4. 사용자에게 결제 재시도 안내 메시지 표시 중인지 확인 (프론트 `/payment/fail`)
5. 토스페이먼츠 복구 후 미처리 주문 수동 확인

**예방**: Webhook으로 결제 상태 비동기 동기화 구성됨

---

### 시나리오 2 — DB 다운

**증상**: `GET /api/v1/health` 응답 `{ status: "error" }`, API 500 에러

**대응 절차**:
1. DB 컨테이너 상태 확인: `docker compose ps`
2. DB 로그 확인: `docker compose logs postgres --tail=100`
3. 디스크 여유 공간 확인: `df -h`
4. DB 재시작: `docker compose restart postgres`
5. 헬스체크 재확인: `curl http://localhost:8080/api/v1/health`
6. 복구 안 되면 백업에서 복원 (아래 참조)

---

### 시나리오 3 — Redis 다운

**증상**: 캐시 관련 에러 로그, 응답 지연 (캐시 미스로 DB 직접 조회)

**대응 절차**:
1. Redis 재시작: `docker compose restart redis`
2. 앱은 캐시 없이도 동작 (DB 직접 조회로 폴백)
3. 재시작 후 캐시 워밍업은 자동으로 진행됨

---

### 시나리오 4 — 이메일 발송 실패

**증상**: 수강 완료 이메일 미수신, 에러 로그에 SMTP 관련 메시지

**대응 절차**:
1. SMTP 설정 환경변수 확인 (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`)
2. 이메일 발송 실패는 결제/수강에 영향 없음 (catch로 처리됨)
3. SMTP 서비스 상태 확인

---

## 로그 조회

```bash
# 실시간 로그 스트리밍
docker compose logs -f backend

# 에러만 필터
docker compose logs backend | grep '"level":"error"'

# 특정 서비스 로그
docker compose logs backend | grep '"context":"PaymentService"'

# 파일 로그 직접 확인
cat /opt/solving-meal/logs/error-$(date +%Y-%m-%d).log
```

---

## 배포 및 롤백

### 정상 배포

```bash
cd /opt/solving-meal
docker compose pull
docker compose up -d
docker image prune -f
curl http://localhost:8080/api/v1/health
```

### 롤백

```bash
# GitHub Actions에서 이전 배포의 SHA 확인
# docker-compose.yaml의 이미지 태그를 sha-<이전_SHA>로 변경
docker compose up -d
```

---

## 정기 점검 항목 (주 1회)

- [ ] `GET /api/v1/health` 응답 확인
- [ ] 에러 로그 검토 (`logs/error-*.log`)
- [ ] Docker 이미지/컨테이너 정리 (`docker system prune`)
- [ ] DB 용량 확인
- [ ] `npm audit` 취약점 확인
