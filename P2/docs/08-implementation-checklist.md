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

## Phase 6 — 장바구니

### 백엔드
- [ ] CartItem 엔티티 (user_id, course_id, added_at, UNIQUE 제약)
- [ ] `GET /cart` — 내 장바구니 목록 + 총 금액 계산
- [ ] `POST /cart` — 코스 추가 (중복·이미 수강 중 검증)
- [ ] `DELETE /cart/:courseId` — 항목 개별 삭제
- [ ] `DELETE /cart` — 전체 비우기
- [ ] Course 엔티티에 `price`, `maxStudents` 컬럼 추가

### 프론트엔드
- [ ] Cart.tsx — 장바구니 목록 UI + 총 금액 표시
- [ ] CourseDetail에 "장바구니 담기" 버튼 추가
- [ ] CartApi.ts 모듈 생성

---

## Phase 7 — 결제 (토스페이먼츠)

### 백엔드
- [ ] Order / OrderItem / PaymentLog 엔티티 생성
- [ ] OrderStatus enum (PENDING/PAID/CANCELLED/REFUNDED/PARTIAL_REFUNDED)
- [ ] PaymentEventType enum
- [ ] `POST /payments/prepare` — 주문 생성 (tossOrderId 발급)
- [ ] `POST /payments/confirm` — 토스 승인 확정 (QueryRunner 트랜잭션)
  - [ ] totalAmount 검증 (위변조 방지)
  - [ ] 토스 API 호출
  - [ ] PaymentLog 기록 (tossRawResponse JSONB 저장)
  - [ ] Enrollment 자동 생성
  - [ ] CartItem 삭제
- [ ] `POST /payments/cancel` — 취소/환불
  - [ ] 토스 API 취소 호출
  - [ ] PaymentLog 기록
  - [ ] OrderItem.isRefunded = true
  - [ ] Enrollment 비활성화
- [ ] `GET /payments/orders` — 주문 이력 목록
- [ ] `GET /payments/orders/:id` — 주문 상세 + PaymentLog
- [ ] TossPaymentsClient (axios 래핑, 시크릿 키 관리)
- [ ] 강의 폐강/인원 미달 자동 취소 처리 로직

### 프론트엔드
- [ ] `@tosspayments/tosspayments-sdk` 설치 및 연동
- [ ] Cart.tsx에서 `POST /payments/prepare` → 토스 결제창 오픈
- [ ] PaymentSuccess.tsx — 결제 완료 후 confirm API 호출
- [ ] PaymentFail.tsx — 결제 실패 처리
- [ ] OrderHistory.tsx — 주문 이력 + 환불 버튼
- [ ] PaymentApi.ts 모듈 생성

---

## Phase 8 — 수강 이력 & 이어보기

### 백엔드
- [ ] VideoWatchLog 엔티티 생성 (user_id, video_id, watchedDuration, isCompleted, UNIQUE)
- [ ] `PATCH /videos/:id/progress` — 시청 위치 upsert
- [ ] `GET /videos/:id/progress` — 마지막 시청 위치 반환
- [ ] Enrollment.watchedVideos(M:N JoinTable) → VideoWatchLog 방식으로 마이그레이션
- [ ] 코스별 수강률 계산 서비스 (`completedCount / totalVideos * 100`)

### 프론트엔드
- [ ] VideoDetail에 YouTube Player API 연동
- [ ] 30초 주기 progress 저장 인터벌 구현
- [ ] 페이지 진입 시 `seekTo(watchedDuration)` 이어보기
- [ ] WatchLogApi.ts 모듈 생성

---

## Phase 9 — 리뷰

### 백엔드
- [ ] Review 엔티티 (user_id, course_id, rating, content, UNIQUE)
- [ ] `GET /courses/:courseId/reviews` — 리뷰 목록 (공개)
- [ ] `POST /courses/:courseId/reviews` — 작성 (80% 수강 검증)
- [ ] `PUT /courses/:courseId/reviews/:id` — 수정 (본인만)
- [ ] `DELETE /courses/:courseId/reviews/:id` — 삭제 (본인만)
- [ ] 수강률 80% 미만 시 403 반환 로직

### 프론트엔드
- [ ] CourseDetail에 리뷰 목록 + 별점 표시
- [ ] 리뷰 작성 폼 (수강 80% 미만 시 비활성화 + 안내 메시지)
- [ ] ReviewApi.ts 모듈 생성

---

## Phase 10 — 북마크

### 백엔드
- [ ] Bookmark 엔티티 (user_id, video_id, positionSec, note)
- [ ] `GET /videos/:videoId/bookmarks` — 내 북마크 목록
- [ ] `POST /videos/:videoId/bookmarks` — 북마크 추가
- [ ] `PATCH /bookmarks/:id` — 메모 수정
- [ ] `DELETE /bookmarks/:id` — 삭제

### 프론트엔드
- [ ] VideoDetail에 "북마크" 버튼 (현재 재생 위치 기준)
- [ ] 북마크 사이드패널 — 클릭 시 해당 위치로 seekTo
- [ ] BookmarkApi.ts 모듈 생성

---

## Phase 11 — 미완성 문서 산출물

| 산출물 | 상태 |
|---|---|
| `docs/p1/retrospective.md` | ❌ 미작성 |
| `docs/p2/requirements.md` | ❌ 미작성 |
| `docs/p2/security-outline.md` | ❌ 미작성 |
| `docs/p2/erd.md` | ❌ 미작성 |
| `docs/p2/openapi.yaml` | ❌ 미작성 (Swagger 코드 → yaml 추출 필요) |
| `docs/p2/threat-model.md` | ❌ 미작성 |
| `docs/p2/auth-spec.md` | ❌ 미작성 |
| `docs/p2/e2e-cases.md` | ❌ 미작성 |
| `docs/p2/observability.md` | ❌ 미작성 |
| `docs/p2/perf-notes.md` | ❌ 미작성 |

---

## Phase 12 — 운영 강화 (모니터링/성능)

### 백엔드
- [ ] Helmet.js 설치 및 적용
- [ ] `@nestjs/throttler` Rate Limiting (로그인 15분/20회)
- [ ] Sentry 또는 Winston 로거 연동
- [ ] 주요 테이블 인덱스 추가 (`course_id`, `user_id`, `enrolled_at` 등)
- [ ] 슬로우 쿼리 식별 및 최적화 기록

### 프론트엔드
- [ ] ProtectedRoute 컴포넌트 (TEACHER 전용 페이지 보호)
- [ ] Playwright 또는 Cypress 설치
- [ ] e2e 테스트 — 로그인 → 장바구니 담기 → 결제 플로우
