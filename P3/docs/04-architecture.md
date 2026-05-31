# Solving Meal — 기술 스택 및 아키텍처

## 기술 스택

### 프론트엔드

| 기술 | 버전 | 역할 |
|---|---|---|
| **Vite** | ^8.0.1 | 빌드 도구 |
| **React** | ^19.2.4 | UI 프레임워크 |
| **TypeScript** | - | 타입 안전성 |
| **React Router DOM** | ^7.13.2 | SPA 라우팅 |
| **Axios** | ^1.13.6 | HTTP 클라이언트 |
| **Zustand** | ^5.0.12 | 전역 상태 관리 (인증) |
| **TanStack Query** | ^5.95.2 | 서버 상태 캐싱 |
| **CSS Modules** | - | 컴포넌트 단위 스타일 |

### 백엔드

| 기술 | 버전 | 역할 |
|---|---|---|
| **NestJS** | ^11.0.1 | REST API 서버 프레임워크 |
| **TypeScript** | - | 타입 안전성 |
| **TypeORM** | ^11.0.0 | ORM (PostgreSQL) |
| **@nestjs/jwt** | ^11.0.2 | JWT 이중 토큰 발급 |
| **passport-jwt** | ^4.0.1 | JWT Strategy |
| **bcrypt** | ^6.0.0 | 비밀번호 해싱 |
| **class-validator** | ^0.14.4 | DTO 입력 검증 |
| **@nestjs/swagger** | ^11.2.6 | API 문서 자동화 |
| **helmet** | latest | HTTP 보안 헤더 (XSS, 클릭재킹 방어) |
| **@nestjs/throttler** | ^6.x | Rate Limiting (무차별 공격 방어) |
| **@nestjs-modules/mailer + nodemailer** | latest | 이메일 알림 발송 (SMTP) |
| **@nestjs/schedule** | ^4.x | 크론 기반 배치 스케쥴러 |
| **@nestjs/terminus** | ^10.x | 헬스체크 API (`/health`) |
| **prom-client + @willsoto/nestjs-prometheus** | latest | Prometheus 메트릭 수집 |
| **nest-winston + winston** | latest | 구조화 JSON 로그 + 일별 파일 로테이션 |
| **@nestjs/cache-manager** | ^3.x | 캐시 추상화 레이어 |
| **cache-manager** | ^6.x | cache-manager 코어 (peer dep) |
| **@keyv/redis** | ^5.x | Redis 캐시 어댑터 (Keyv 기반) |

### 프론트엔드 (P3 추가)

| 기술 | 역할 |
|---|---|
| **@tosspayments/tosspayments-sdk** | 토스페이먼츠 결제창 SDK |
| **React.lazy + Suspense** | 코드 스플리팅 (초기 번들 크기 축소) |

### 인프라

| 기술 | 역할 |
|---|---|
| **PostgreSQL** | 관계형 데이터베이스 |
| **Redis** | 응답 캐시 (TTL 기반) |
| **Docker + Docker Hub** | 컨테이너 이미지 빌드 및 배포 |
| **docker-compose** | 멀티 컨테이너 로컬/서버 실행 |
| **YouTube Data API** | 영상 ID 기반 외부 연동 |

---

## 프로젝트 디렉토리 구조

```
solving-meal/
├── client/                         # 프론트엔드 (React + Vite)
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf                  # 프로덕션 Nginx 설정
│   ├── Dockerfile
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                 # 라우터 설정 (React.lazy 코드 스플리팅)
│       ├── index.css               # 글로벌 스타일
│       ├── api/
│       │   ├── ApiClient.ts        # Axios 인스턴스 + refreshPromise 뮤텍스
│       │   ├── AuthApi.ts
│       │   ├── CourseApi.ts        # updateCourse 포함
│       │   ├── CartApi.ts
│       │   ├── PaymentApi.ts       # 토스페이먼츠 연동
│       │   ├── EnrollmentApi.ts
│       │   ├── UserApi.ts
│       │   ├── VideoApi.ts
│       │   ├── WatchLogApi.ts
│       │   ├── ReviewApi.ts
│       │   ├── BookmarkApi.ts
│       │   └── SubscriptionApi.ts  # P3 신규
│       ├── components/
│       │   ├── course/
│       │   │   └── CourseCard.tsx
│       │   ├── layout/
│       │   │   └── Navbar.tsx      # role 기반 메뉴 분기
│       │   └── ProtectedRoute.tsx  # 인증/역할 라우트 보호
│       ├── pages/
│       │   ├── Home.tsx
│       │   ├── Courses.tsx         # AbortController 적용
│       │   ├── CourseDetail.tsx    # 장바구니 경유 결제 통일
│       │   ├── CreateCourse.tsx
│       │   ├── EditCourse.tsx      # P3 신규 — 코스 수정
│       │   ├── RegisterVideo.tsx
│       │   ├── TeacherCourse.tsx   # 미리보기/수정/영상 등록 버튼
│       │   ├── Cart.tsx
│       │   ├── PaymentSuccess.tsx  # P3 신규
│       │   ├── PaymentFail.tsx     # P3 신규
│       │   ├── OrderHistory.tsx    # P3 신규
│       │   ├── MyCourses.tsx
│       │   ├── VideoDetail.tsx
│       │   ├── Login.tsx
│       │   ├── Signup.tsx
│       │   └── Profile.tsx
│       ├── store/
│       │   └── AuthStore.ts
│       └── types/
│
└── server/                         # 백엔드 (NestJS)
    ├── package.json
    ├── nest-cli.json
    ├── Dockerfile
    ├── docker-compose.yaml
    ├── .env.example
    └── src/
        ├── main.ts                 # helmet, throttler, winston 전역 적용
        ├── app.module.ts
        ├── auth/
        ├── user/
        ├── courses/
        ├── videos/
        ├── enrollments/
        ├── teacher/                # PATCH /:id 코스 수정 포함
        ├── cart/
        ├── payments/               # 토스페이먼츠 SDK 연동
        ├── reviews/
        ├── bookmarks/
        ├── watch-logs/
        ├── notifications/          # P3 신규 — 이메일/디스코드 발송
        ├── subscriptions/          # P3 신규 — 구독 관리
        ├── scheduler/              # P3 신규 — @nestjs/schedule 크론 잡
        ├── health/                 # P3 신규 — @nestjs/terminus 헬스체크
        └── common/
            ├── dto/api-response.dto.ts
            ├── enums/user-role.enum.ts
            ├── filters/exception.filter.ts
            ├── guards/roles.guard.ts
            ├── interceptors/cache.interceptor.ts  # Redis 캐시
            ├── interceptors/logging.interceptor.ts
            └── decorators/
```

---

## 시스템 아키텍처

```
┌────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React SPA (Nginx, port 80 / Vite dev port 5173)     │   │
│  │  ┌───────────┐  ┌───────────┐  ┌─────────────────┐  │   │
│  │  │ Pages     │  │ Zustand   │  │ Axios            │  │   │
│  │  │ React.lazy│  │ AuthStore │  │ refreshPromise   │  │   │
│  │  │ + Suspense│  │           │  │ mutex            │  │   │
│  │  └───────────┘  └───────────┘  └────────┬────────┘  │   │
│  └───────────────────────────────────────── │ ──────────┘   │
└──────────────────────────────────────────── │ ─────────────┘
                                              │ HTTP /api/v1
┌──────────────────────────────────────────── │ ─────────────┐
│  NestJS Server (port 8080)                  │              │
│  ┌────────────────────────────────────────▼────────────┐  │
│  │  helmet (보안 헤더) + ThrottlerGuard (Rate Limit)    │  │
│  │  GlobalPipe: ValidationPipe                         │  │
│  │  GlobalFilter: HttpExceptionFilter                  │  │
│  │  WinstonLogger (구조화 JSON 로그)                    │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │  JwtAccessGuard → RolesGuard → Controller           │  │
│  │  → Service → CacheInterceptor (Redis) → Repository  │  │
│  │  → TypeORM                                          │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │  @nestjs/schedule 크론 잡                            │  │
│  │  → NotificationService → Nodemailer / Discord HTTP  │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │  /health (terminus) │ /metrics (prom-client)        │  │
│  └──────────┬─────────────────────┬────────────────────┘  │
└─────────────│─────────────────────│──────────────────────  ┘
              │ TCP                 │ TCP
┌─────────────▼──────┐  ┌──────────▼──────────────────────┐
│  PostgreSQL         │  │  Redis                          │
│  (모든 영구 데이터)  │  │  (응답 캐시, TTL 기반)           │
└────────────────────┘  └─────────────────────────────────┘
```

---

## 데이터 흐름

```
[수강 신청]
1. 사용자가 코스 상세에서 수강 신청 버튼 클릭
2. POST /api/v1/courses/:courseId/enroll
   Authorization: Bearer <accessToken>
3. JwtAccessGuard → req.user 주입
4. EnrollmentService: 유저/코스 존재 확인 → 중복 확인 → 생성
5. 201 Created → 프론트엔드 상태 업데이트

[토큰 재발급]
1. API 요청 → 401 Unauthorized (accessToken 만료)
2. Axios 인터셉터에서 POST /api/v1/auth/refresh 자동 호출
3. Refresh Token 유효성 검증 (DB 조회, 만료/폐기 확인)
4. 새 Access + Refresh 토큰 발급
5. 기존 Refresh Token 삭제 후 신규 저장 (RTR 방식)
6. 원래 요청 재시도
```

---

## 데이터 흐름 — P3 추가

```
[Redis 캐시 흐름]
1. GET /courses/list 요청 수신
2. CacheInterceptor → Redis에서 키 조회
3. HIT: Redis 캐시 응답 반환 (DB 조회 없음)
4. MISS: DB 조회 → 결과를 Redis에 저장 (TTL 60s) → 반환

[알림 발송 흐름]
1. 신규 강의 등록 (POST /teacher) 완료
2. NotificationService.notifyNewCourse() 호출
3. Subscription 테이블에서 newCourse=true 구독자 조회
4. channel=EMAIL → Nodemailer SMTP 발송
   channel=DISCORD → axios.post(webhookUrl, embed payload)
5. 발송 결과 → NotificationLog 기록

[스케쥴러 배치 흐름]
1. @Cron('0 9 * * *') — 매일 오전 9시 트리거
2. 전날 등록된 신규 강의 목록 조회
3. 구독자 이메일/디스코드 일괄 발송
4. 발송 수 및 실패 건수 WinstonLogger 기록
```

---

## 개발 서버 구성

| 서버 | 포트 | 명령어 |
|---|---|---|
| 프론트엔드 (Vite) | 5173 | `cd client && npm run dev` |
| 백엔드 (NestJS) | 8080 | `cd server && npm run start:dev` |
| PostgreSQL | 5432 | `docker run -e POSTGRES_PASSWORD=... postgres` |
| Redis | 6379 | `docker run redis:alpine` |
| Swagger 문서 | 8080/api/docs | 서버 실행 후 자동 생성 |
| 헬스체크 | 8080/health | DB + Redis 상태 확인 |
| Prometheus 메트릭 | 8080/metrics | prom-client 텍스트 포맷 |

### docker-compose 전체 실행 (P3)

```bash
# P3/server/docker-compose.yaml 기준
docker-compose up -d

# 재배포 (이미지 최신화 후)
docker-compose pull && docker-compose up -d
```

### docker-compose.yaml 구조 (4개 서비스)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: solvingmeal
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru

  server:
    image: 3n1hye/solvingmeal-backend:latest
    env_file: .env
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/solvingmeal
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    ports:
      - "8080:8080"

  client:
    image: 3n1hye/solvingmeal-frontend:latest
    ports:
      - "80:80"
    depends_on:
      - server

volumes:
  postgres_data:
```

### NestJS 서버 Dockerfile (멀티 스테이지 빌드)

```dockerfile
# Stage 1: 빌드
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: 실행
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/main"]
```

### React 클라이언트 Dockerfile (Nginx 서빙)

```dockerfile
# Stage 1: 빌드
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Nginx 서빙
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```nginx
# nginx.conf — SPA 라우팅 지원 + API 프록시
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  # SPA 폴백: 모든 경로를 index.html로
  location / {
    try_files $uri $uri/ /index.html;
  }

  # 정적 파일 캐시
  location ~* \.(js|css|png|svg|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```
