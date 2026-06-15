# Runbook — Solving Meal (P1 기준)

## 서비스 구성

| 컴포넌트 | 포트 | 설명 |
|---|---|---|
| NestJS API 서버 | 8080 | 백엔드 REST API |
| React 클라이언트 | 80 (prod) / 5173 (dev) | 프론트엔드 |
| PostgreSQL | 5432 | 메인 DB |
| Redis | 6379 | 캐시 / 세션 |

---

## 배포 절차

### 운영 배포 (Docker Compose)

```bash
# 1. 최신 이미지 pull
docker compose pull

# 2. 서비스 재시작 (무중단)
docker compose up -d

# 3. 불필요한 이미지 정리
docker image prune -f

# 4. 헬스체크 확인
curl http://localhost:8080/api/v1/health
```

### 개발 환경 실행

```bash
# 백엔드
cd P3/server
cp .env.example .env   # 환경변수 설정
docker compose -f docker-compose.dev.yaml up -d  # DB + Redis
npm run start:dev

# 프론트엔드
cd P3/client
npm run dev
```

---

## 롤백 절차

```bash
# 이전 이미지 태그로 롤백
docker compose down
docker pull 3n1hye/solvingmeal-backend:sha-<이전_SHA>
docker pull 3n1hye/solvingmeal-frontend:sha-<이전_SHA>

# docker-compose.yaml의 image 태그를 이전 SHA로 변경 후
docker compose up -d
```

---

## 장애 대응

### DB 연결 실패

```bash
# 1. DB 컨테이너 상태 확인
docker compose ps

# 2. DB 로그 확인
docker compose logs postgres --tail=50

# 3. DB 재시작
docker compose restart postgres

# 4. 헬스체크 재확인
curl http://localhost:8080/api/v1/health
```

### API 서버 응답 없음

```bash
# 1. 컨테이너 상태 확인
docker compose ps

# 2. 서버 로그 확인 (최근 100줄)
docker compose logs backend --tail=100

# 3. 컨테이너 재시작
docker compose restart backend
```

### 디스크 부족

```bash
# 로그 파일 정리 (14일 이상 오래된 것)
find /opt/solving-meal/logs -name "*.log" -mtime +14 -delete

# Docker 미사용 리소스 정리
docker system prune -f
```

---

## 모니터링 엔드포인트

| 엔드포인트 | 설명 |
|---|---|
| `GET /api/v1/health` | DB 연결 상태 헬스체크 |
| `GET /api/v1/metrics` | Prometheus 메트릭 |
| `GET /api/docs` | Swagger API 문서 (SWAGGER_ENABLED=true 시) |

---

## 환경변수 목록

| 변수명 | 설명 | 예시 |
|---|---|---|
| `DATABASE_URL` | PostgreSQL 연결 URL | `postgresql://user:pass@localhost:5432/db` |
| `REDIS_URL` | Redis 연결 URL | `redis://localhost:6379` |
| `JWT_ACCESS_SECRET` | JWT 액세스 토큰 시크릿 | 32자 이상 랜덤 |
| `JWT_REFRESH_SECRET` | JWT 리프레시 토큰 시크릿 | 32자 이상 랜덤 |
| `CLIENT_URL` | 허용할 프론트엔드 URL | `https://solving-meal.vercel.app` |
| `PORT` | 서버 포트 | `8080` |
| `NODE_ENV` | 실행 환경 | `production` |
| `SWAGGER_ENABLED` | Swagger 노출 여부 | `false` (운영) |
