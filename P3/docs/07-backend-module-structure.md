# Solving Meal — 백엔드 모듈 구조

## NestJS 모듈 구성

```
AppModule
├── ConfigModule (전역)
├── TypeOrmModule (전역, PostgreSQL)
├── AuthModule
├── UserModule
├── CourseModule
├── VideosModule
├── EnrollmentsModule
└── TeacherModule
```

전역 설정:
- `ValidationPipe` — whitelist, forbidNonWhitelisted, transform 활성화
- `HttpExceptionFilter` — HTTP 예외 응답 표준화
- `AllExceptionFilter` — 예기치 못한 예외 전체 처리

---

## 모듈별 상세

### AuthModule

**역할:** 회원가입, 로그인, 토큰 재발급, 로그아웃

```
auth/
├── auth.controller.ts          POST /auth/* 엔드포인트
├── auth.module.ts
├── services/
│   ├── auth.service.ts         비즈니스 로직
│   ├── token.service.ts        JWT 토큰 생성 (Access + Refresh)
│   └── refresh-token.service.ts  RefreshToken DB CRUD
├── strategies/
│   ├── jwt-access.strategy.ts  JwtAccessStrategy (Passport)
│   └── jwt-refresh.strategy.ts JwtRefreshStrategy (Passport)
├── guards/
│   ├── jwt-access.guard.ts
│   └── jwt-refresh.guard.ts
├── dto/
│   ├── register-request.dto.ts { email, password, nickname, role }
│   └── token-response.dto.ts   { accessToken, refreshToken }
└── entities/
    └── refresh-token.entity.ts
```

의존성: `UserModule`, `JwtModule`, `ConfigModule`

---

### UserModule

**역할:** 유저 조회, 프로필 수정, 이메일/비밀번호 기반 조회

```
user/
├── user.controller.ts          GET/PATCH /user/me
├── user.service.ts             findById, findByEmail, create, update
├── user.module.ts
├── entities/user.entity.ts
├── repositories/user.repository.ts
├── interfaces/user-repository.interface.ts
└── dto/
    ├── update-user-request.dto.ts
    ├── update-user-response.dto.ts
    └── user-detail-response.dto.ts
```

`findByEmailWithPassword()` — `select: false` 컬럼을 포함한 특수 쿼리 (로그인 용도)

---

### CourseModule

**역할:** 코스 목록 조회, 상세 조회, 수강 중인 코스 목록

```
courses/
├── course.controller.ts        GET /courses/list, /courses/my, /courses/:id
├── course.service.ts
├── course.repository.ts
├── course.module.ts
├── entities/
│   ├── course.entity.ts
│   └── enums/
│       ├── category.enum.ts    KOREAN|JAPANESE|CHINESE|WESTERN|BAKING|SIDE_DISH|ONE_DISH
│       └── difficulty.enum.ts  HIGH|MEDIUM|LOW
├── interfaces/
│   └── courses-repository.interface.ts
└── dto/
    ├── course-query.dto.ts          필터 파라미터 DTO
    ├── course-list-response.dto.ts
    ├── course-detail.response.dto.ts
    ├── create-course-request.dto.ts
    ├── create-course-response.dto.ts
    ├── teacher-item.dto.ts
    ├── video-item.dto.ts
    └── couser-registration-response.dto.ts
```

`forwardRef(() => EnrollmentService)` — 순환 의존성 해결

---

### VideosModule

**역할:** 영상 상세 조회, 영상 등록 (TEACHER 전용)

```
videos/
├── video.controller.ts         GET /videos/:id, POST /videos
├── video.service.ts
├── video.module.ts
├── entities/video.entity.ts
├── interfaces/video-repository.interface.ts
└── dto/
    ├── create-video.dto.ts      { youtubeVideoId, title, duration, courseId }
    ├── create-video-response.dto.ts
    └── get-video-detail.dto.ts
```

영상 등록은 `@Roles(UserRole.TEACHER)` + `RolesGuard`로 TEACHER만 가능.

---

### EnrollmentsModule

**역할:** 수강 신청, 수강 목록 조회

```
enrollments/
├── enrollment.controller.ts    POST /courses/:courseId/enroll
├── enrollment.service.ts
├── enrollment.repository.ts
├── enrollment.module.ts
├── entities/enrollment.entity.ts
└── interfaces/enrollment-repository.interface.ts
```

`forwardRef(() => CourseService)` — 순환 의존성 해결

---

### TeacherModule

**역할:** 선생님의 코스 생성 및 자신의 코스 목록 조회

```
teacher/
├── teacher.controller.ts       POST /teacher, GET /teacher
├── teacher.service.ts
└── teacher.module.ts
```

---

### CartModule — **신규**

**역할:** 장바구니 항목 CRUD. 결제 전까지 항목 영구 보존.

```
cart/
├── cart.controller.ts          GET/POST/DELETE /cart
├── cart.service.ts
├── cart.module.ts
├── entities/cart-item.entity.ts
└── dto/
    └── add-to-cart.dto.ts      { courseId }
```

**핵심 로직:**
- `addToCart`: 이미 담긴 코스 중복 방지 (UNIQUE 제약), 이미 수강 중인 코스 방지
- 결제 완료(`PaymentService`) 시 해당 유저의 관련 cart_items 일괄 삭제

---

### PaymentsModule — **신규**

**역할:** 주문 생성, 토스 결제 승인/취소, 환불, 결제 이력 조회

```
payments/
├── payments.controller.ts      POST /payments/prepare|confirm|cancel, GET /payments/orders
├── payments.service.ts
├── toss-payments.client.ts     토스 API HTTP 클라이언트 (axios 래핑)
├── payments.module.ts
├── entities/
│   ├── order.entity.ts
│   ├── order-item.entity.ts
│   └── payment-log.entity.ts
└── dto/
    ├── prepare-order.dto.ts    { courseIds[] }
    ├── confirm-payment.dto.ts  { paymentKey, orderId, amount }
    └── cancel-payment.dto.ts   { orderId, cancelReason, refundAmount? }
```

**결제 승인 트랜잭션 (원자적 처리):**
```
1. DB에서 tossOrderId 주문 조회 + totalAmount 검증
2. 토스 POST /v1/payments/confirm 호출
3. TypeORM QueryRunner 트랜잭션:
   - order.status = PAID, paidAt = now
   - PaymentLog 생성 (PAYMENT_CONFIRMED, tossRawResponse 저장)
   - 각 OrderItem별 Enrollment 생성
   - CartItem 삭제
4. 어느 단계라도 실패 시 전체 롤백
```

---

### ReviewsModule — **신규**

**역할:** 코스 리뷰 CRUD. 80% 수강 조건 검증.

```
reviews/
├── reviews.controller.ts       GET|POST|PUT|DELETE /courses/:courseId/reviews
├── reviews.service.ts
├── reviews.module.ts
├── entities/review.entity.ts
└── dto/
    └── create-review.dto.ts    { rating: 1~5, content }
```

**80% 수강 검증:**
```typescript
// reviews.service.ts
async checkCanReview(userId: string, courseId: string): Promise<boolean> {
  const totalVideos = await this.videoRepo.countByCourse(courseId)
  const watched = await this.watchLogRepo.countCompleted(userId, courseId)
  return watched / totalVideos >= 0.8
}
```

---

### BookmarksModule — **신규**

**역할:** 영상 재생 위치 북마크 CRUD

```
bookmarks/
├── bookmarks.controller.ts     GET|POST /videos/:videoId/bookmarks
│                               PATCH|DELETE /bookmarks/:bookmarkId
├── bookmarks.service.ts
├── bookmarks.module.ts
├── entities/bookmark.entity.ts
└── dto/
    └── create-bookmark.dto.ts  { positionSec, note? }
```

---

### WatchLogsModule — **신규**

**역할:** 영상 시청 위치 기록 및 조회 (이어보기)

```
watch-logs/
├── watch-logs.controller.ts    PATCH|GET /videos/:id/progress
├── watch-logs.service.ts
├── watch-logs.module.ts
└── entities/video-watch-log.entity.ts
```

**핵심 로직:**
```typescript
// watch-logs.service.ts — upsert 패턴
async updateProgress(userId, videoId, watchedDuration, isCompleted) {
  await this.repo.upsert(
    { userId, videoId, watchedDuration, isCompleted, lastWatchedAt: new Date() },
    ['userId', 'videoId'],   // conflict target
  )
}
```

---

## Repository 패턴

모든 모듈은 인터페이스 기반 Repository 패턴을 사용합니다.

```typescript
// 인터페이스 정의
export const COURSE_REPOSITORY = 'COURSE_REPOSITORY';

export interface ICourseRepository {
  findById(id: string): Promise<Course | null>;
  findByQuery(...): Promise<Course[] | null>;
  create(...): Promise<Course | null>;
  // ...
}

// 모듈에서 DI 주입
{
  provide: COURSE_REPOSITORY,
  useClass: CourseRepository,
}
```

서비스에서는 `@Inject(COURSE_REPOSITORY)` 로 주입받아 구현체에 직접 의존하지 않습니다. 이 패턴 덕분에 테스트 시 Mock Repository로 교체가 용이합니다.

---

## 공통 유틸리티 (`common/`)

| 파일 | 역할 |
|---|---|
| `dto/api-response.dto.ts` | `ApiResponseDto<T>` — 표준 응답 형식 |
| `enums/user-role.enum.ts` | `UserRole.STUDENT / TEACHER / ADMIN` |
| `filters/exception.filter.ts` | 전역 예외 필터 (HTTP + All) |
| `guards/roles.guard.ts` | 역할 기반 접근 제어 |
| `decorators/get-user.decorator.ts` | `@GetUser()` — req.user 추출 |
| `decorators/roles.decorator.ts` | `@Roles(UserRole.TEACHER)` 메타데이터 |
