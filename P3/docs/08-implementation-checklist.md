# Solving Meal — 구현 체크리스트

## Phase 1 — 프로젝트 초기 세팅

### 백엔드
- [x] NestJS 프로젝트 생성 (`nest new server`)
- [x] PostgreSQL + TypeORM 연결 (`TypeOrmModule.forRootAsync`)
- [x] ConfigModule 전역 설정 (`.env` 환경변수 로드)
- [x] 전역 ValidationPipe 설정 (whitelist, transform)
- [x] 전역 예외 필터 설정 (`HttpExceptionFilter`, `AllExceptionFilter`)
- [x] Swagger 설정 (`/api/docs`)
- [x] CORS 설정
- [x] tsconfig paths 별칭 설정 (`@auth/*`, `@common/*`)

### 프론트엔드
- [x] Vite + React + TypeScript 프로젝트 생성
- [x] React Router DOM 설정
- [x] Zustand AuthStore 설정
- [x] Axios 인스턴스 + 인터셉터 설정
- [x] 타입 정의 디렉토리 구조

---

## Phase 2 — 인증

### 백엔드
- [x] User 엔티티 생성 (UUID PK, email/password/nickname/role)
- [x] bcrypt `@BeforeInsert()` 비밀번호 해싱
- [x] `select: false` 패스워드 컬럼 보호
- [x] RefreshToken 엔티티 (token, expiresAt, isRevoked, userId)
- [x] `POST /auth/register` — 이메일 중복 확인 + 회원가입
- [x] `POST /auth/login` — 비밀번호 검증 + 이중 JWT 발급
- [x] `POST /auth/refresh` — RTR 방식 토큰 재발급
- [x] `POST /auth/logout` — 리프레시 토큰 전체 삭제
- [x] JwtAccessStrategy / JwtRefreshStrategy (Passport)
- [x] JwtAccessGuard / JwtRefreshGuard
- [x] `@GetUser()` 커스텀 데코레이터
- [x] TokenService (Access + Refresh 토큰 생성)
- [x] RefreshTokenService (save, validate, deleteOne, deleteAll)

### 프론트엔드
- [x] Login 페이지 + API 연동
- [x] Signup 페이지 + API 연동
- [x] Zustand persist 미들웨어 (auth-storage)
- [x] Axios 인터셉터 — 401 시 자동 토큰 재발급
- [x] Navbar — 로그인/로그아웃 상태 반영

---

## Phase 3 — 코스 & 영상

### 백엔드
- [x] Course 엔티티 (category/difficulty/requiredTools JSONB)
- [x] Video 엔티티 (youtubeVideoId/title/duration)
- [x] Category enum (KOREAN/JAPANESE/CHINESE/WESTERN/BAKING/SIDE_DISH/ONE_DISH)
- [x] Difficulty enum (HIGH/MEDIUM/LOW)
- [x] `GET /courses/list` — 필터 + 페이지네이션
- [x] `GET /courses/:id` — 상세 (영상 목록, 총 재생시간)
- [x] `GET /courses/my` — 수강 중인 코스 목록
- [x] `POST /teacher` — 코스 생성 (TEACHER)
- [x] `GET /teacher` — 선생님 코스 목록
- [x] `GET /videos/:id` — 영상 상세
- [x] `POST /videos` — 영상 등록 (TEACHER + RolesGuard)
- [x] `computedVideoCount` / `computedTotalDuration` getter
- [x] Repository 인터페이스 패턴 적용

### 프론트엔드
- [x] Courses.tsx — 코스 목록 + 필터 UI
- [x] CourseDetail.tsx — 상세 + 수강 신청 버튼
- [x] CourseCard 컴포넌트
- [x] VideoDetail.tsx — YouTube embed
- [x] CreateCourse.tsx — 코스 생성 폼 (TEACHER)
- [x] RegisterVideo.tsx — 영상 등록 폼 (TEACHER)
- [x] TeacherCourses.tsx — 선생님 코스 관리

---

## Phase 4 — 수강 신청

### 백엔드
- [x] Enrollment 엔티티 (isCompleted, enrolledAt, completedAt, watchedVideos M:N)
- [x] `POST /courses/:courseId/enroll` — 수강 신청 (중복 방지)
- [x] `findAllByUser()` — 수강 목록 조회
- [x] 순환 의존성 해결 (`forwardRef`)

### 프론트엔드
- [x] MyCourses.tsx — 수강 중인 코스 목록
- [x] 수강 신청 API 연동 (CourseDetail)

---

## Phase 5 — 사용자 프로필

### 백엔드
- [x] `GET /user/me` — 내 정보 조회
- [x] `PATCH /user/me` — 프로필 수정

### 프론트엔드
- [x] Profile.tsx — 프로필 조회 + 수정 UI
- [x] App.tsx `useEffect` — 초기 로드 시 유저 정보 동기화

---

## 미완성 / 개선 필요 항목 (기존 코드 기준)

| 항목 | 우선순위 | 설명 |
|---|---|---|
| CORS 도메인 제한 | 높음 | 현재 `origin: true` (전체 허용) → 프로덕션 도메인 지정 필요 |
| Rate Limiting | 높음 | 로그인·회원가입 무제한 요청 가능 |
| 영상 시청 완료 처리 | 높음 | `watchedVideos` 대신 `VideoWatchLog` 엔티티로 교체 필요 |
| ADMIN 역할 기능 | 낮음 | enum 정의만 있고 실제 관리자 기능 없음 |
| 테스트 코드 | 중간 | Jest 설정은 있으나 실제 테스트 없음 |
| Helmet.js | 높음 | HTTP 보안 헤더 미설정 |
| 페이지 인증 가드 | 중간 | 프론트엔드 라우트 보호 미적용 (TEACHER 전용 페이지 접근 가능) |

---

## Phase 6 — 장바구니 ✅ 완료 (P2)

### 백엔드
- [x] CartItem 엔티티 (user_id, course_id, added_at, UNIQUE 제약)
- [x] `GET /cart` — 내 장바구니 목록 + 총 금액 계산
- [x] `POST /cart` — 코스 추가 (중복·이미 수강 중 검증)
- [x] `DELETE /cart/:courseId` — 항목 개별 삭제
- [x] `DELETE /cart` — 전체 비우기
- [x] Course 엔티티에 `price` 컬럼 추가

### 프론트엔드
- [x] Cart.tsx — 장바구니 목록 UI + 총 금액 표시
- [x] CourseDetail에 "장바구니 담기" 버튼 추가
- [x] CartApi.ts 모듈 생성

---

## Phase 8 — 수강 이력 & 이어보기 ✅ 완료 (P2)

### 백엔드
- [x] VideoWatchLog 엔티티 (user_id, video_id, watchedDuration, isCompleted, UNIQUE)
- [x] `PATCH /videos/:id/progress` — 시청 위치 upsert
- [x] `GET /videos/:id/progress` — 마지막 시청 위치 반환

### 프론트엔드
- [x] VideoDetail — 30초 주기 progress 저장 인터벌
- [x] 페이지 진입 시 `seekTo(watchedDuration)` 이어보기
- [x] WatchLogApi.ts 모듈 생성

---

## Phase 9 — 리뷰 ✅ 완료 (P2)

### 백엔드
- [x] Review 엔티티 (user_id, course_id, rating, content, UNIQUE)
- [x] `GET /courses/:courseId/reviews` — 리뷰 목록 (공개)
- [x] `POST /courses/:courseId/reviews` — 작성 (80% 수강 검증)
- [x] `PUT /courses/:courseId/reviews/:id` — 수정 (본인만)
- [x] `DELETE /courses/:courseId/reviews/:id` — 삭제 (본인만)

### 프론트엔드
- [x] CourseDetail에 리뷰 목록 + 별점 표시
- [x] 리뷰 작성 폼 + ReviewApi.ts 모듈 생성

---

## Phase 10 — 북마크 ✅ 완료 (P2)

### 백엔드
- [x] Bookmark 엔티티 (user_id, video_id, positionSec, note)
- [x] `GET /videos/:videoId/bookmarks`, `POST`, `PATCH`, `DELETE`

### 프론트엔드
- [x] VideoDetail 북마크 버튼 + 사이드패널
- [x] BookmarkApi.ts 모듈 생성

---

## Phase 12 — ProtectedRoute ✅ 완료 (P2)

### 프론트엔드
- [x] ProtectedRoute 컴포넌트 (미로그인 → /login, role 불일치 → /)
- [x] App.tsx 전체 라우트에 ProtectedRoute 적용

---

## P3 버그 수정 ✅ 완료

- [x] 토큰 재발급 경쟁 조건 해결 — `refreshPromise` 뮤텍스 패턴 (ApiClient.ts)
- [x] 선생님 본인 강의 영상 미리보기 허용 — `isOwner` 체크 (video.service.ts)
- [x] Navbar "내 강의" 메뉴 TEACHER 로그인 시 숨김 (Navbar.tsx)
- [x] 코스 수정 기능 추가 — PATCH `/teacher/:id` + EditCourse.tsx
- [x] 무료 강의 장바구니 경유 강제 — CourseDetail 직접 수강 신청 분기 제거

---

## Phase 13 — 결제 (토스페이먼츠) 🔨 진행 예정

### 백엔드
- [ ] Order / OrderItem / PaymentLog 엔티티 생성
- [ ] OrderStatus enum (PENDING/PAID/CANCELLED/REFUNDED/PARTIAL_REFUNDED)
- [ ] `POST /payments/prepare` — 주문 생성 (tossOrderId 발급)
- [ ] `POST /payments/confirm` — 토스 승인 확정 (QueryRunner 트랜잭션)
  - [ ] totalAmount 검증 (위변조 방지)
  - [ ] 토스 API `POST /v1/payments/confirm` 호출 (`axios` + `TOSS_SECRET_KEY`)
  - [ ] PaymentLog 기록 (tossRawResponse JSONB)
  - [ ] Enrollment 자동 생성, CartItem 삭제
- [ ] `POST /payments/cancel` — 취소/환불 (본인 주문 확인 필수)
- [ ] `GET /payments/orders` / `GET /payments/orders/:id`
- [ ] `POST /payments/webhook` — 토스 Webhook 수신
  - [ ] Authorization 헤더로 시크릿 키 검증
  - [ ] 멱등성 처리 (중복 이벤트 무시)
  - [ ] payment_logs 이벤트 기록 + order.status 동기화

### 프론트엔드
- [ ] `@tosspayments/tosspayments-sdk` 설치
- [ ] `client/.env`에 `VITE_TOSS_CLIENT_KEY` 설정
- [ ] Cart.tsx → prepare → 토스 결제창 오픈
- [ ] PaymentSuccess.tsx — confirm API 호출
- [ ] PaymentFail.tsx — 실패 안내
- [ ] OrderHistory.tsx — 주문 이력 + 환불 버튼

---

## Phase 14 — 보안 강화 🔨 진행 예정

### 백엔드
- [ ] `helmet` 설치 및 `app.use(helmet())` 적용 — XSS·클릭재킹 방어
- [ ] `@nestjs/throttler` 설치 — 전역 Rate Limiting (기본 60req/60s)
  - [ ] 로그인 엔드포인트 개별 제한 (15분/10회)
- [ ] TypeORM 파라미터 바인딩 전면 검토 — Raw Query 사용 여부 확인 (SQL 인젝션 방어)
- [ ] `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` 전역 적용 확인
- [ ] `@Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)` 비밀번호 복잡도 검증 추가 (`register-request.dto.ts`)
- [ ] Request Body 크기 제한 — `app.use(express.json({ limit: '1mb' }))`
- [ ] CORS origin 환경변수 기반 제한 — `origin: process.env.CLIENT_URL` (현재 `origin: true` → 반드시 수정)

---

## Phase 15 — 알림 & 구독 🔨 진행 예정

### 백엔드
- [ ] Subscription 엔티티 (channel, target, newCourse, enrollmentComplete)
- [ ] NotificationLog 엔티티 (channel, eventType, payload, status)
- [ ] `@nestjs-modules/mailer` + nodemailer 설치 및 SMTP 설정
- [ ] `GET/POST/PATCH/DELETE /subscriptions` CRUD
- [ ] NotificationService — `sendEmail()`, `sendDiscord()`
- [ ] 신규 강의 등록 시 EMAIL/DISCORD 구독자 즉시 알림
- [ ] 수강 완료 시 본인 이메일 알림

---

## Phase 16 — 스케쥴러 & 배치 🔨 진행 예정

### 백엔드
- [ ] `@nestjs/schedule` 설치
- [ ] 매일 오전 9시 — 신규 강의 일괄 알림 크론 잡
- [ ] 만료된 PENDING 주문 자동 취소 크론 잡 (24시간 초과)
- [ ] 발송 결과 NotificationLog 기록

---

## Phase 17 — 모니터링 & 로깅 🔨 진행 예정

### 백엔드
- [ ] `nest-winston` + `winston-daily-rotate-file` 설치
- [ ] WinstonModule 전역 로거 등록 (JSON 구조화 로그)
- [ ] `@nestjs/terminus` 설치 — `/health` 엔드포인트 (DB + Redis 상태)
- [ ] `prom-client` + `@willsoto/nestjs-prometheus` 설치
  - [ ] `/metrics` 엔드포인트 등록
  - [ ] HTTP 요청 수/응답 시간 커스텀 메트릭

---

## Phase 18 — 성능 최적화 🔨 진행 예정

### 백엔드
- [ ] `@nestjs/cache-manager` + `cache-manager-redis-yet` 설치
- [ ] `GET /courses/list` 응답 Redis 캐시 (TTL 60s)
- [ ] `GET /courses/:id` 응답 Redis 캐시 (TTL 120s)
- [ ] TypeORM 인덱스 추가
  - [ ] `enrollments(user_id, course_id)`
  - [ ] `video_watch_logs(user_id, video_id)`
  - [ ] `courses(category, difficulty)`

### 프론트엔드
- [ ] `React.lazy` + `Suspense`로 페이지 단위 코드 스플리팅 (App.tsx)
- [ ] 초기 번들 크기 측정 (vite build --report)

---

## Phase 19 — 배포 🔨 진행 예정

- [ ] `P3/server/Dockerfile` — NestJS 멀티 스테이지 빌드
- [ ] `P3/client/Dockerfile` + `nginx.conf` — React 정적 빌드 + Nginx 서빙
- [ ] `docker-compose.yaml` — nestjs + react + postgresql + redis 4개 서비스
- [ ] Docker Hub 이미지 푸시 (`3n1hye/solvingmeal-backend:latest`, `3n1hye/solvingmeal-frontend:latest`)
- [ ] 서버에서 `docker-compose pull && docker-compose up -d` 재배포
