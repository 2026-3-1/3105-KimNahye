# Solving Meal — API 설계

## 기술 스택

| 기술 | 역할 |
|---|---|
| **NestJS + TypeScript** | REST API 서버 프레임워크 |
| **TypeORM** | ORM (PostgreSQL 연동) |
| **JWT (액세스 + 리프레시)** | 이중 토큰 인증 |
| **bcrypt** | 비밀번호 해싱 (saltRounds=10) |
| **class-validator / class-transformer** | DTO 기반 입력 검증 |
| **Swagger (@nestjs/swagger)** | API 문서 자동 생성 |
| **passport-jwt** | JWT Strategy 전략 구현 |
| **helmet** | HTTP 보안 헤더 (XSS·클릭재킹 방어) |
| **@nestjs/throttler** | Rate Limiting (로그인·회원가입 등) |
| **@nestjs-modules/mailer + nodemailer** | 이메일 알림 발송 |
| **@nestjs/schedule** | 크론 기반 배치 스케쥴러 |
| **@nestjs/terminus** | 헬스체크 (`/health`) |
| **prom-client + @willsoto/nestjs-prometheus** | Prometheus 메트릭 수집 |
| **nest-winston + winston** | 구조화 JSON 로그 + 일별 파일 로테이션 |
| **@nestjs/cache-manager + @keyv/redis + cache-manager** | Redis 응답 캐시 |

---

## 공통 응답 형식

모든 API 응답은 `ApiResponseDto<T>` 포맷을 따릅니다.

```json
{
  "statusCode": 200,
  "message": "강의 목록 조회에 성공하였습니다.",
  "data": { ... }
}
```

에러 응답 예시:
```json
{
  "statusCode": 404,
  "message": "강의를 찾을 수 없습니다.",
  "data": null
}
```

---

## 글로벌 API 접두사

모든 엔드포인트는 `/api/v1` 접두사를 사용합니다. (예: `POST /api/v1/auth/login`)

---

## 인증 API (`/auth`)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| POST | `/auth/register` | ✗ | 회원가입 |
| POST | `/auth/login` | ✗ | 로그인 → Access + Refresh 토큰 반환 |
| POST | `/auth/refresh` | ✓ Refresh | 액세스 토큰 재발급 |
| POST | `/auth/logout` | ✓ Access | 로그아웃 (리프레시 토큰 전체 삭제) |

### POST `/auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "홍길동",
  "role": "student"
}
```

**Response 201:**
```json
{
  "statusCode": 201,
  "message": "회원가입 성공",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "nickname": "홍길동",
    "role": "student"
  }
}
```

**에러:** `409` — 이미 사용 중인 이메일

### POST `/auth/login`

**Request:**
```json
{ "email": "user@example.com", "password": "password123" }
```

**Response 200:**
```json
{
  "statusCode": 200,
  "message": "로그인 성공",
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

**토큰 만료 시간:**
- Access Token: 1시간 (프로덕션 5분)
- Refresh Token: 7일 (프로덕션 1시간)

---

## 코스 API (`/courses`)

모든 엔드포인트는 **JWT Access Token** 필요 (`Authorization: Bearer <token>`)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/courses/list` | ✓ | 코스 목록 조회 (필터/페이지네이션) |
| GET | `/courses/my` | ✓ | 내 수강 코스 목록 |
| GET | `/courses/:id` | ✓ | 코스 상세 조회 |

### GET `/courses/list` 쿼리 파라미터

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `category` | Category enum | 카테고리 필터 |
| `difficulty` | Difficulty enum | 난이도 필터 |
| `requiredTools` | string[] | 필요 도구 필터 |
| `duration` | number | 총 재생 시간 필터 (초) |
| `page` | number | 페이지 번호 (기본 1) |
| `limit` | number | 페이지 크기 (기본 10) |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "teacher": { "id": "uuid", "name": "김셰프" },
      "videoCount": 5,
      "category": "KOREAN",
      "difficulty": "LOW",
      "requiredTools": ["프라이팬", "도마"]
    }
  ]
}
```

### GET `/courses/:id` — 코스 상세

```json
{
  "data": {
    "id": "uuid",
    "teacher": { "id": "uuid", "name": "김셰프" },
    "videos": [
      { "id": "uuid", "title": "된장찌개 기초", "duration": 720 }
    ],
    "category": "KOREAN",
    "difficulty": "LOW",
    "requiredTools": ["냄비"],
    "videoCount": 3,
    "totalDuration": 2400,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

## 선생님 API (`/teacher`)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| POST | `/teacher` | ✓ TEACHER | 코스 생성 |
| GET | `/teacher` | ✓ TEACHER | 내 코스 목록 (선생님 기준) |
| PATCH | `/teacher/:id` | ✓ TEACHER | 코스 수정 (본인 코스만) |

### POST `/teacher` — 코스 생성

**Request:**
```json
{
  "category": "BAKING",
  "difficulty": "MEDIUM",
  "requiredTools": ["오븐", "믹서기"],
  "price": 0
}
```

**Response 201:** 생성된 코스 정보 반환

### PATCH `/teacher/:id` — 코스 수정 — **P3 신규**

**Request (부분 업데이트, 모든 필드 선택적):**
```json
{
  "category": "WESTERN",
  "difficulty": "HIGH",
  "requiredTools": ["오븐", "핸드믹서"],
  "price": 29000
}
```

**처리:**
1. `course.teacher.id !== req.user.id` → `403 Forbidden`
2. 존재하지 않는 코스 → `404 Not Found`
3. 제공된 필드만 선택적 업데이트 (`PATCH` 의미론)

**Response 200:** `{ "statusCode": 200, "message": "강의가 수정되었습니다.", "data": null }`

---

## 영상 API (`/videos`)

| Method | Endpoint | Auth | Role | 설명 |
|---|---|---|---|---|
| GET | `/videos/:id` | ✓ | - | 영상 상세 조회 (수강 여부 확인) |
| POST | `/videos` | ✓ | TEACHER | 영상 등록 |

### POST `/videos` — 영상 등록 (TEACHER 전용)

**Request:**
```json
{
  "youtubeVideoId": "dQw4w9WgXcQ",
  "title": "에어프라이어 치킨 만들기",
  "duration": 840,
  "courseId": "uuid"
}
```

---

## 수강 API

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| POST | `/courses/:courseId/enroll` | ✓ | 수강 신청 |

**에러:**
- `404` — 존재하지 않는 유저 또는 강좌
- `409` — 이미 수강 신청된 강좌

---

## 장바구니 API (`/cart`) — **신규**

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/cart` | ✓ | 내 장바구니 목록 조회 |
| POST | `/cart` | ✓ | 코스를 장바구니에 추가 |
| DELETE | `/cart/:courseId` | ✓ | 장바구니 항목 개별 삭제 |
| DELETE | `/cart` | ✓ | 장바구니 전체 비우기 |

**POST `/cart` Request:**
```json
{ "courseId": "uuid" }
```
**에러:** `409` — 이미 장바구니에 담긴 코스, `400` — 이미 구매한 코스

---

## 결제 API (`/payments`) — **신규**

결제 흐름: 클라이언트 → 토스 결제창 → 토스 리다이렉트 → 서버 승인 확정

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| POST | `/payments/prepare` | ✓ | 주문 생성 (PENDING), tossOrderId 반환 |
| POST | `/payments/confirm` | ✓ | 토스 결제 승인 확정 + 수강 등록 |
| POST | `/payments/cancel` | ✓ | 결제 취소/환불 요청 |
| GET | `/payments/orders` | ✓ | 내 주문 이력 목록 |
| GET | `/payments/orders/:orderId` | ✓ | 주문 상세 + 결제 로그 |

### POST `/payments/prepare` — 주문 생성

**Request:**
```json
{ "courseIds": ["uuid1", "uuid2"] }
```
**Response 201:**
```json
{
  "data": {
    "orderId": "uuid",
    "tossOrderId": "order_20260101_abc123",
    "totalAmount": 59000,
    "items": [
      { "courseId": "uuid1", "title": "된장찌개 마스터", "price": 29000 },
      { "courseId": "uuid2", "title": "에어프라이어 요리", "price": 30000 }
    ]
  }
}
```

### POST `/payments/confirm` — 결제 승인

토스페이먼츠 결제창 완료 후 클라이언트가 받은 파라미터를 그대로 전달합니다.

**Request:**
```json
{
  "paymentKey": "toss_pk_xxx",
  "orderId": "order_20260101_abc123",
  "amount": 59000
}
```
**처리 순서:**
1. DB에서 `tossOrderId` 일치 주문 조회, `totalAmount` 검증 (위변조 방지)
2. 토스 `POST /v1/payments/confirm` 호출
3. 성공 시 → `order.status = PAID`, `payment_logs` 기록, `enrollments` 자동 생성, `cart_items` 삭제
4. 실패 시 → `order.status = PENDING` 유지, `payment_logs`에 실패 이벤트 기록

**Response 200:** 주문 상세 + 생성된 enrollment 목록

### POST `/payments/cancel` — 취소/환불

```json
{
  "orderId": "uuid",
  "cancelReason": "단순 변심",
  "refundAmount": 29000      // 부분 환불 시 금액 지정, 전액이면 생략
}
```
**처리:** 토스 `POST /v1/payments/{paymentKey}/cancel` 호출 → `payment_logs` 기록 → `order_items.isRefunded = true` → 해당 `enrollment` 비활성화

---

## 수강 이력 / 이어보기 API — **신규**

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| PATCH | `/videos/:id/progress` | ✓ | 시청 위치 업데이트 (30초마다 호출) |
| GET | `/videos/:id/progress` | ✓ | 마지막 시청 위치 조회 (이어보기) |

### PATCH `/videos/:id/progress`

```json
{ "watchedDuration": 342, "isCompleted": false }
```
- `watchedDuration`: 현재까지 시청한 초(sec)
- `isCompleted`: 영상의 90% 이상 시청 시 `true` 전송

---

## 리뷰 API (`/reviews`) — **신규**

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/courses/:courseId/reviews` | ✗ | 코스 리뷰 목록 |
| POST | `/courses/:courseId/reviews` | ✓ | 리뷰 작성 (80% 수강 확인) |
| PUT | `/courses/:courseId/reviews/:reviewId` | ✓ | 내 리뷰 수정 |
| DELETE | `/courses/:courseId/reviews/:reviewId` | ✓ | 내 리뷰 삭제 |

**POST Request:**
```json
{ "rating": 5, "content": "정말 쉽게 배울 수 있어서 좋았어요!" }
```
**에러:** `403` — 80% 미만 수강, `409` — 이미 리뷰 작성됨

---

## 북마크 API (`/bookmarks`) — **신규**

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/videos/:videoId/bookmarks` | ✓ | 영상의 내 북마크 목록 |
| POST | `/videos/:videoId/bookmarks` | ✓ | 북마크 추가 |
| PATCH | `/bookmarks/:bookmarkId` | ✓ | 북마크 메모 수정 |
| DELETE | `/bookmarks/:bookmarkId` | ✓ | 북마크 삭제 |

**POST Request:**
```json
{ "positionSec": 182, "note": "고추장 비율 중요!" }
```

---

## 사용자 API (`/user`)

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/user/me` | ✓ | 내 프로필 조회 |
| PATCH | `/user/me` | ✓ | 프로필 수정 (nickname 등) |

---

## 알림 구독 API (`/subscriptions`) — **P3 신규**

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/subscriptions` | ✓ | 내 구독 목록 조회 |
| POST | `/subscriptions` | ✓ | 구독 등록 (이메일 또는 디스코드) |
| PATCH | `/subscriptions/:id` | ✓ | 구독 설정 수정 (알림 종류 on/off) |
| DELETE | `/subscriptions/:id` | ✓ | 구독 해지 |

### POST `/subscriptions` — 구독 등록

**Request:**
```json
{
  "channel": "EMAIL",
  "target": "user@example.com",
  "newCourse": true,
  "enrollmentComplete": true
}
```

디스코드 구독 예시:
```json
{
  "channel": "DISCORD",
  "target": "https://discord.com/api/webhooks/xxx/yyy",
  "newCourse": true,
  "enrollmentComplete": false
}
```

**에러:** `409` — 동일 채널+대상으로 이미 구독 중

---

## 모니터링 API — **P3 신규**

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| GET | `/health` | ✗ | 헬스체크 (DB·Redis 상태) |
| GET | `/metrics` | ✗ | Prometheus 메트릭 스크레이핑 |

### GET `/health` — 헬스체크

`@nestjs/terminus` 기반. 응답 예시:
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

### GET `/metrics` — Prometheus 메트릭

`prom-client` + `@willsoto/nestjs-prometheus` 기반. Prometheus 텍스트 형식으로 반환:
- `http_requests_total` — 요청 수 (라벨: method, route, status)
- `http_request_duration_seconds` — 응답 시간 히스토그램
- `nodejs_heap_size_used_bytes` — 힙 메모리

---

## Discord Webhook 알림 — **P3 신규**

Discord Webhook은 별도 엔드포인트 없이 서버 내부에서 직접 `axios.post(webhookUrl, payload)` 호출.

**발송 시점:**
- 신규 강의 등록 시 `channel: DISCORD` 구독자에게 즉시 발송
- `@nestjs/schedule` 배치 크론 실행 후 결과 요약 발송

**Payload 형식:**
```json
{
  "username": "SolvingMeal Bot",
  "embeds": [{
    "title": "새 강의가 등록되었습니다!",
    "description": "카테고리: 한식 | 난이도: 하 | 가격: 무료",
    "color": 15158332
  }]
}
```

---

## 토스페이먼츠 Webhook 수신 — **P3 신규**

토스페이먼츠가 결제 상태 변경 시 우리 서버로 POST 요청을 보냅니다. 토스 대시보드에서 Webhook URL을 `<SERVER_URL>/api/v1/payments/webhook`으로 등록합니다.

| Method | Endpoint | Auth | 설명 |
|---|---|---|---|
| POST | `/payments/webhook` | ✗ (시크릿 검증) | 토스페이먼츠 결제 상태 변경 수신 |

### 수신 이벤트 유형

| 이벤트 | 설명 |
|---|---|
| `PAYMENT_STATUS_CHANGED` | 결제 상태 변경 (PAID, CANCELLED 등) |
| `REFUND_STATUS_CHANGED` | 환불 처리 상태 변경 |

### 처리 흐름

```
1. Authorization 헤더에서 토스 시크릿 키 검증
   → 불일치 시 401 Unauthorized 반환
2. paymentKey로 DB에서 order 조회
3. order.status 동기화 (중복 이벤트 멱등 처리)
4. payment_logs 이벤트 기록
5. 200 OK 반환 (실패 시 토스가 최대 5회 재전송)
```

> **멱등성(Idempotency) 필수:** 동일 `paymentKey`의 Webhook이 중복 수신될 수 있으므로, 이미 `PAID` 상태인 주문에 대한 중복 처리를 DB 체크로 방지해야 합니다.

```typescript
// payments.service.ts — Webhook 처리 예시
async handleWebhook(paymentKey: string, status: string): Promise<void> {
  const order = await this.orderRepo.findByPaymentKey(paymentKey);
  if (!order || order.status === OrderStatus.PAID) return; // 멱등 처리
  await this.orderRepo.updateStatus(order.id, status);
  await this.paymentLogRepo.create({ order, eventType: status, ... });
}
```

---

## Swagger 문서

서버 실행 후 `http://localhost:8080/api/docs` 에서 API 문서를 확인할 수 있습니다.

- Access Token: `access-token` Bearer 스키마
- Refresh Token: `refresh-token` Bearer 스키마
- `persistAuthorization: true` — 새로고침 후에도 인증 유지
