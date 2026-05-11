# Solving Meal — Product Requirements Document (PRD)

> P1(MVP) + P2(확장 기능)을 동일 코드베이스에서 단계적으로 구현 가능하도록 작성한 통합 PRD. (실제 구현 상태 반영본)

---

## 1. 제품 개요

### 1.1 비전

**한끼해결(Solving meal)**은 자취생·요리 입문자를 대상으로 하는 **인터랙티브 요리 교육 커리큘럼** 웹 서비스이다.
YouTube 오픈 영상을 코스(커리큘럼) 단위로 묶어, 학습자가 카테고리·난이도·필요 도구 등의 조건으로 맞춤 학습할 수 있게 한다.

### 1.2 핵심 가치

| 가치          | 설명                                             |
| ------------- | ------------------------------------------------ |
| 커리큘럼 중심 | 단순 영상 나열이 아닌 코스 단위 체계적 학습      |
| 자취생 맞춤   | 한식·일식·중식·양식·베이킹·반찬·일품 카테고리    |
| YouTube 연동  | `youtubeVideoId` 기반, 자체 영상 호스팅 없음     |
| 역할 분리     | STUDENT(학습) / TEACHER(코스 운영) / ADMIN(향후) |
| 반응형 SPA    | Vite + React, 모바일 360px ~ 데스크톱 1920px     |

### 1.3 타깃 사용자

- **학습자(STUDENT):** 자취 초보, 혼밥족, 요리 입문 성인
- **강사(TEACHER):** 요리 YouTube 채널 운영자, 요리 강사

---

## 2. 범위 (P1 / P2)

### 2.1 P1 (MVP) — 출시 범위

인증부터 코스 탐색·수강·영상 시청까지의 **최소 동작 가능한 학습 흐름**.

| 모듈   | 기능                                            |
| ------ | ----------------------------------------------- |
| 인증   | 회원가입 / 로그인 / 토큰 재발급(RTR) / 로그아웃 |
| 사용자 | 내 정보 조회·수정                               |
| 코스   | 목록(필터·페이지네이션) / 상세 / 내 수강 코스   |
| 영상   | 영상 상세 (YouTube 임베드)                      |
| 강사   | 코스 생성 / 영상 등록 / 내 코스 목록            |
| 수강   | 수강 신청(중복 방지)                            |

### 2.2 P2 — 확장 범위

학습 경험과 거래 흐름을 강화하는 **부가 기능 + 운영 강화**.

| 모듈        | 기능                                                                                                           |
| ----------- | -------------------------------------------------------------------------------------------------------------- |
| 장바구니    | 담기 / 조회 / 개별·전체 삭제                                                                                   |
| 이어보기    | `video_watch_logs` 기반 시청 위치 저장·복원 (YouTube IFrame Player API의 `getCurrentTime()` 사용, 30초 인터벌) |
| 영상 완료   | 영상 단위 "수강 완료" 버튼 (학습자가 명시적으로 완료 처리) + 90% 자동 판정                                     |
| 리뷰        | 영상 1개 이상 수강 완료 시 작성 가능 / 본인 수정·삭제 / 평균 별점                                              |
| 북마크      | 영상 특정 시점 + 메모 추가·조회·삭제 (메모 수정은 미구현)                                                      |
| 라우트 보호 | ProtectedRoute (인증/역할별)                                                                                   |
| 결제 (계획) | 토스페이먼츠 prepare/confirm/cancel + 주문/결제 로그 (P2에서는 엔티티·API 설계만 완료, 실제 SDK 연동은 미구현) |

> **결제(Phase 7)** 는 토스 SDK 실연동이 필요하여 이번 라운드에서 제외. 코스는 P2에서도 무료 수강 신청 흐름으로 동작.

---

## 3. 사용자 스토리

### 3.1 학습자(STUDENT)

| ID    | As a   | I want to                                             | So that                              |
| ----- | ------ | ----------------------------------------------------- | ------------------------------------ |
| US-1  | 회원   | 이메일·비밀번호로 가입·로그인하고 싶다                | 내 학습 이력을 안전하게 관리한다     |
| US-2  | 학습자 | 카테고리·난이도·도구로 코스를 필터링하고 싶다         | 내 환경에 맞는 레시피를 찾을 수 있다 |
| US-3  | 학습자 | 코스 상세에서 영상 목록과 강사 정보를 보고 싶다       | 등록 전에 충분한 정보로 결정한다     |
| US-4  | 학습자 | 코스를 수강 신청하고 내 코스에서 다시 보고 싶다       | 학습을 이어갈 수 있다                |
| US-5  | 학습자 | 영상을 보다가 멈춰도 다음에 그 위치부터 보고 싶다     | 학습 흐름이 끊기지 않는다 (P2)       |
| US-6  | 학습자 | 영상 하나하나에 명시적으로 수강 완료 표시를 하고 싶다 | 학습 진척도를 직접 관리한다 (P2)     |
| US-7  | 학습자 | 코스를 장바구니에 담아두고 싶다                       | 결제를 한 번에 처리할 수 있다 (P2)   |
| US-8  | 학습자 | 영상 1개라도 수강 완료한 코스에 리뷰를 남기고 싶다    | 후속 학습자에게 도움을 준다 (P2)     |
| US-9  | 학습자 | 내가 쓴 리뷰를 수정/삭제하고 싶다                     | 의견이 바뀌면 갱신할 수 있다 (P2)    |
| US-10 | 학습자 | 영상의 특정 부분에 메모를 남겨두고 싶다               | 다시 찾아볼 수 있다 (P2)             |

### 3.2 강사(TEACHER)

| ID    | As a | I want to                                           | So that                                 |
| ----- | ---- | --------------------------------------------------- | --------------------------------------- |
| US-T1 | 강사 | 카테고리/난이도/필요 도구를 정해 코스를 만들고 싶다 | 학습자에게 체계적인 커리큘럼을 제공한다 |
| US-T2 | 강사 | 내 YouTube 영상을 코스에 연결하고 싶다              | 별도 업로드 없이 콘텐츠를 운영한다      |
| US-T3 | 강사 | 내가 만든 코스를 한눈에 보고 싶다                   | 운영 현황을 파악한다                    |

---

## 4. 기능 명세 (요약)

### 4.1 인증

- `POST /auth/register` — 이메일 unique, bcrypt(saltRounds=10)
- `POST /auth/login` — Access(1h) + Refresh(7d) 이중 토큰
- `POST /auth/refresh` — RTR (기존 토큰 즉시 폐기 후 신규 쌍 발급)
- `POST /auth/logout` — 해당 유저 Refresh Token 일괄 삭제
- Axios 인터셉터: 401 자동 재발급. 단 `/auth/login`, `/auth/register`, `/auth/refresh`는 제외(로그인 실패 시 에러 메시지 유지)

### 4.2 코스 / 영상

- `GET /courses/list?category=&difficulty=&requiredTools=&duration=&page=&limit=`
- `GET /courses/:id` — 영상 목록·총 재생시간·강사 정보
- `GET /courses/my` — 내 수강 코스 (강의 수 정확 표시)
- `POST /teacher` — 코스 생성 (TEACHER)
- `GET /teacher` — 강사 본인 코스 목록
- `POST /videos` — 영상 등록 (TEACHER, RolesGuard)
- `GET /videos/:id` — 영상 상세 (수강 여부 확인)

### 4.3 수강

- `POST /courses/:courseId/enroll` — 수강 신청 (중복 409)

### 4.4 장바구니 (P2)

- `GET /cart` / `POST /cart` / `DELETE /cart/:courseId` / `DELETE /cart`
- 이미 수강 중 → 400 / 이미 담김 → 409

### 4.5 이어보기 & 수강 완료 (P2)

- `PATCH /videos/:id/progress` — 30초 인터벌마다 실제 재생 위치(`getCurrentTime()`)를 upsert
- `GET /videos/:id/progress` — 페이지 진입 시 마지막 위치 조회
- 90% 이상 시청 시 `isCompleted=true` 자동 전송
- **영상 단위 "수강 완료" 버튼** — 클릭 시 즉시 `isCompleted=true` 마킹, 완료 후 비활성화

### 4.6 리뷰 (P2)

- `GET /courses/:courseId/reviews` (공개)
- `POST /courses/:courseId/reviews` — 영상 1개 이상 완료 검증, 미달 403, 중복 작성 409
- `PUT /courses/:courseId/reviews/:reviewId` — 본인 리뷰 수정 (별점·내용)
- `DELETE /courses/:courseId/reviews/:reviewId` — 본인 리뷰 삭제

### 4.7 북마크 (P2)

- `GET /videos/:videoId/bookmarks` — 영상별 본인 북마크 목록
- `POST /videos/:videoId/bookmarks` — 위치(`positionSec`, 실제 재생 위치) + 메모로 추가
- `DELETE /bookmarks/:bookmarkId` — 삭제
- (참고) `PATCH /bookmarks/:bookmarkId` 메모 수정 API는 백엔드 정의는 있으나 **UI 미구현**

### 4.8 결제 (P2 설계, 미구현)

- `POST /payments/prepare` → tossOrderId 발급
- `POST /payments/confirm` → 토스 승인 + Enrollment 생성 + Cart 삭제
- `POST /payments/cancel` → 토스 취소 + 환불 처리
- `GET /payments/orders[/:orderId]` → 주문 이력
- 모든 트랜잭션 원문은 `payment_logs.tossRawResponse`(JSONB) 저장

---

## 5. 데이터 모델 (개요)

| 엔티티                                    | 비고                                                                   | P1/P2     |
| ----------------------------------------- | ---------------------------------------------------------------------- | --------- |
| `users`                                   | UUID PK, email unique, password `select:false`, role enum              | P1        |
| `refresh_tokens`                          | token(text), expiresAt, isRevoked                                      | P1        |
| `courses`                                 | category/difficulty enum, requiredTools(JSONB), price(int), teacher FK | P1        |
| `videos`                                  | youtubeVideoId, duration(int), course/teacher FK                       | P1        |
| `enrollments`                             | user×course, isCompleted, enrolledAt                                   | P1        |
| `video_watch_logs`                        | UNIQUE(user, video), watchedDuration, isCompleted                      | P2        |
| `cart_items`                              | UNIQUE(user, course)                                                   | P2        |
| `reviews`                                 | UNIQUE(user, course), rating(1~5), content                             | P2        |
| `bookmarks`                               | user, video, positionSec, note                                         | P2        |
| `orders` / `order_items` / `payment_logs` | OrderStatus, PaymentEventType, tossRawResponse JSONB                   | P2 (설계) |

자세한 ERD/엔티티 정의는 `P2/docs/02-data-model.md` 참조.

---

## 6. 기술 스택

### 6.1 프론트엔드

| 기술               | 버전    | 역할                                  |
| ------------------ | ------- | ------------------------------------- |
| Vite               | ^8.0.1  | 빌드 도구                             |
| React              | ^19.2.4 | UI                                    |
| React Router DOM   | ^7.13.2 | SPA 라우팅                            |
| Axios              | ^1.13.6 | HTTP + 401 인터셉터(자동 재발급)      |
| Zustand            | ^5.0.12 | 인증 상태 (persist)                   |
| TanStack Query     | ^5.95.2 | 서버 상태 캐시                        |
| YouTube IFrame API | -       | 실제 재생 위치 기반 progress / 북마크 |
| CSS Modules        | -       | 컴포넌트 단위 스타일                  |

### 6.2 백엔드

| 기술                       | 버전    | 역할                                           |
| -------------------------- | ------- | ---------------------------------------------- |
| NestJS                     | ^11.0.1 | REST API 프레임워크                            |
| TypeORM                    | ^11.0.0 | PostgreSQL ORM (`synchronize: true` 개발 모드) |
| @nestjs/jwt + passport-jwt | -       | 이중 토큰 인증                                 |
| bcrypt                     | ^6.0.0  | 비밀번호 해싱                                  |
| class-validator            | ^0.14.4 | DTO 검증                                       |
| @nestjs/swagger            | ^11.2.6 | `/api/docs` 자동 생성                          |

### 6.3 인프라

- **PostgreSQL** (UUID PK, JSONB)
- **YouTube Data API** / IFrame Player API (영상 ID 기반)
- API Prefix: `/api/v1`
- 개발 포트: 클라이언트 5173 / 서버 8080

---

## 7. 비기능 요구사항

| 항목          | 요구사항                                                                 |
| ------------- | ------------------------------------------------------------------------ |
| 인증          | JWT 이중 토큰, RTR 방식                                                  |
| 응답 포맷     | 전체 API 응답이 `ApiResponseDto<T>` `{ statusCode, message, data }` 통일 |
| 입력 검증     | 전역 ValidationPipe (whitelist, transform)                               |
| 에러 처리     | HttpExceptionFilter + AllExceptionFilter 전역                            |
| 인터셉터 정책 | `/auth/*` 엔드포인트는 401 자동 재발급 대상 제외                         |
| 보안(권고)    | Helmet.js, Rate Limiting(`@nestjs/throttler`), CORS 도메인 제한          |
| 반응형        | 360px ~ 1920px                                                           |
| 문서화        | Swagger persistAuthorization, Repository 인터페이스 패턴                 |

---

## 8. 시스템 아키텍처

```
[Browser]
  React SPA (Vite 5173)
    ├ React Router  ├ Zustand AuthStore  ├ Axios + TanStack Query
    └ YouTube IFrame Player API (영상 시청 페이지)
                                          │ HTTP /api/v1
[NestJS Server :8080]
  Global ValidationPipe / ExceptionFilter
  JwtAccessGuard → RolesGuard → Controller → Service → Repository → TypeORM
                                          │ TCP
[PostgreSQL]
  users · refresh_tokens · courses · videos · enrollments
  cart_items · video_watch_logs · reviews · bookmarks
  orders · order_items · payment_logs (설계)
```

데이터 흐름 예시는 `P2/docs/04-architecture.md` 참조.

---

## 9. 마일스톤

### P1 (완료)

1. 프로젝트 초기 세팅 (NestJS + Vite, ConfigModule, Swagger, ValidationPipe, ExceptionFilter)
2. 인증 모듈 (회원가입/로그인/RTR 재발급/로그아웃, 이중 JWT)
3. 코스 & 영상 (필터·페이지네이션·상세, TEACHER 코스/영상 등록)
4. 수강 신청 (Enrollment, 중복 방지)
5. 사용자 프로필 (조회/수정)

### P2 (대부분 완료, 결제 제외)

6. **장바구니** — CartItem, GET/POST/DELETE
7. **결제** _(설계 완료, SDK 연동 미구현)_
8. **이어보기 + 영상 수강 완료** — VideoWatchLog, YouTube IFrame API 기반 30초 인터벌, seekTo, 영상별 완료 버튼
9. **리뷰** — 영상 1개 이상 완료 시 작성 가능, 본인 수정/삭제, 평균 별점
10. **북마크** — 영상 시점+메모 추가/조회/삭제 (메모 수정 UI 미구현)
11. 산출 문서 (현재 작업)
12. **운영 강화** — ProtectedRoute(완료), Helmet/Throttler/Sentry(권고)

---

## 10. 성공 지표 (제안)

| 지표                                  | 목표     |
| ------------------------------------- | -------- |
| 회원가입 → 첫 수강 신청 전환율        | 40% 이상 |
| 코스 평균 완강률 (`isCompleted` 비율) | 30% 이상 |
| 1편 이상 완료자의 리뷰 작성률         | 25% 이상 |
| API 평균 응답 시간 (p95)              | < 300ms  |
| 결제 성공률 (P2 결제 출시 후)         | > 98%    |

---

## 11. 위험 요소 & 대응

| 위험                               | 영향           | 대응                                                       |
| ---------------------------------- | -------------- | ---------------------------------------------------------- |
| YouTube 정책 변경/영상 비공개 처리 | 콘텐츠 깨짐    | 영상 등록 시 ID 유효성 점검, 깨진 영상 신고 기능(향후)     |
| 결제 연동 지연                     | P2 출시 지연   | P2에서 엔티티/API 설계는 선행 완료, SDK 연동만 별도 라운드 |
| `synchronize: true` 운영 사고      | DB 데이터 손상 | 프로덕션 배포 전 `migrations` 전환 필수                    |
| CORS `origin: true`                | XSS/요청 위조  | 프로덕션 도메인 화이트리스트 적용                          |
| 인증 무제한 시도                   | 계정 탈취      | `@nestjs/throttler` 도입 (로그인 15분/20회 권고)           |

---

## 12. 향후 로드맵 (P3+ 후보)

- 토스페이먼츠 SDK 실연동 + 환불 자동화
- **북마크 메모 수정 UI** (백엔드 API는 이미 존재)
- 강사 수익 정산 / 학습자 수강률 대시보드
- ADMIN 콘솔 (코스/유저/결제 관리)
- 영상 순서 드래그 정렬 UI
- 학습 알림 (이어보기 알림, 신규 코스 알림)
- e2e 테스트 (Playwright/Cypress) — 로그인 → 장바구니 → 결제 시나리오

---

## 13. 참고 문서

- `P2/docs/01-project-overview.md` — 프로젝트 개요
- `P2/docs/02-data-model.md` — DB & ERD 상세
- `P2/docs/03-api-design.md` — API 명세
- `P2/docs/04-architecture.md` — 시스템 아키텍처
- `P2/docs/08-implementation-checklist.md` — Phase별 구현 체크리스트
- `P2/docs/p2-checklist.md` — P2 구현 현황
- `docs/사용자기능_요구사항명세서.md`
- `docs/강사기능_요구사항명세서.md`
