# Solving Meal — 데이터베이스 & 데이터 모델

## 데이터베이스 선택: PostgreSQL + TypeORM

| 기준 | 근거 |
|---|---|
| 관계형 모델 | User ↔ Course ↔ Video ↔ Enrollment 다대다/일대다 관계 |
| UUID PK | 보안 및 분산 환경 대비 (`PrimaryGeneratedColumn('uuid')`) |
| JSONB | `requiredTools`를 문자열 배열로 유연하게 저장 |
| TypeORM 엔티티 자동 동기화 | 개발 환경에서 `synchronize: true` |

---

## ERD

```
┌─────────────────┐          ┌──────────────────┐
│     users        │          │  refresh_tokens   │
│  id (UUID, PK)  │◄─────────│  id (UUID, PK)   │
│  email (unique) │  1:N     │  token (text)     │
│  password       │          │  expires_at       │
│  nickname       │          │  is_revoked       │
│  role (enum)    │          │  user_id (FK)     │
│  created_at     │          └──────────────────┘
│  updated_at     │
└────────┬────────┘
         │ 1:N (teacher)        1:N (cart_items)
         │ 1:N (enrollments)    1:N (orders)
         │ 1:N (reviews)        1:N (bookmarks)
         │
    ┌────┴──────────────┐        ┌──────────────────┐
    │      courses       │        │      videos       │
    │  id (UUID, PK)    │◄───────│  id (UUID, PK)   │
    │  teacher_id (FK)  │  1:N   │  youtubeVideoId  │
    │  title            │        │  title           │
    │  price            │ ◄──┐   │  duration (int)  │
    │  max_students     │    │   │  sort_order      │
    │  category (enum)  │    │   │  teacher_id (FK) │
    │  difficulty (enum)│    │   │  course_id (FK)  │
    │  requiredTools    │    │   └────────┬─────────┘
    │  (jsonb)          │    │            │
    └────────┬──────────┘    │   ┌────────┴──────────┐
             │               │   │  video_watch_logs  │
             │ 1:N           │   │  id (UUID, PK)    │
    ┌────────┴──────────┐    │   │  user_id (FK)     │
    │    enrollments     │    │   │  video_id (FK)    │
    │  id (UUID, PK)    │    │   │  watched_duration │
    │  user_id (FK)     │    │   │  is_completed     │
    │  course_id (FK)   │    │   │  last_watched_at  │
    │  is_completed     │    │   └───────────────────┘
    │  enrolled_at      │    │
    │  completed_at     │    │   ┌──────────────────┐
    └───────────────────┘    │   │    bookmarks      │
                             │   │  id (UUID, PK)   │
    ┌───────────────────┐    │   │  user_id (FK)    │
    │    cart_items      │    │   │  video_id (FK)   │
    │  id (UUID, PK)    │    │   │  position_sec    │
    │  user_id (FK)     │────┘   │  note (nullable) │
    │  course_id (FK)   │        │  created_at      │
    │  added_at         │        └──────────────────┘
    └───────────────────┘
                             ┌──────────────────────────┐
    ┌───────────────────┐    │         orders            │
    │      reviews       │    │  id (UUID, PK)           │
    │  id (UUID, PK)    │    │  user_id (FK)            │
    │  user_id (FK)     │    │  toss_payment_key (unique)│
    │  course_id (FK)   │    │  total_amount            │
    │  rating (1~5)     │    │  status (enum)           │
    │  content          │    │  ordered_at              │
    │  created_at       │    │  paid_at (nullable)      │
    └───────────────────┘    └──────────┬───────────────┘
                                        │ 1:N
                             ┌──────────┴───────────────┐
                             │       order_items         │
                             │  id (UUID, PK)           │
                             │  order_id (FK)           │
                             │  course_id (FK)          │
                             │  price_at_purchase       │
                             └──────────────────────────┘

                             ┌──────────────────────────┐
                             │     payment_logs          │
                             │  id (UUID, PK)           │
                             │  order_id (FK)           │
                             │  event_type (enum)       │
                             │  amount                  │
                             │  toss_raw_response (jsonb│
                             │  created_at              │
                             └──────────────────────────┘
```

---

## 테이블 상세 정의

### 1. `users` (사용자)

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255, select: false })  // 조회 시 기본 제외
  password: string;

  @Column({ length: 50 })
  nickname: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

**UserRole enum**

| 값 | 설명 |
|---|---|
| `student` | 일반 학습자 (기본값) |
| `teacher` | 코스 생성·영상 등록 가능 |
| `admin` | 향후 관리자용 (현재 미사용) |

비밀번호는 `@BeforeInsert()` 훅에서 bcrypt(saltRounds=10)로 해싱됩니다.

---

### 2. `refresh_tokens` (리프레시 토큰)

```typescript
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  token: string;              // 해싱된 리프레시 토큰

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'is_revoked', type: 'boolean', default: false })
  isRevoked: boolean;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

- `isExpired()`, `isValid()` 메서드로 토큰 상태 확인
- 로그아웃 및 재발급 시 해당 유저의 모든 토큰 일괄 삭제

---

### 3. `courses` (코스)

```typescript
@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.courses, { nullable: false })
  teacher: User;

  @Column()
  category: Category;

  @Column()
  difficulty: Difficulty;

  @Column({ type: 'jsonb' })
  requiredTools: string[];    // ["에어프라이어", "오븐"] 형식

  @OneToMany(() => Video, (video) => video.course)
  videos: Video[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];
}
```

**Category enum**

| 값 | 설명 |
|---|---|
| `KOREAN` | 한식 |
| `JAPANESE` | 일식 |
| `CHINESE` | 중식 |
| `WESTERN` | 양식 |
| `BAKING` | 베이킹 |
| `SIDE_DISH` | 반찬 |
| `ONE_DISH` | 일품요리 |

**Difficulty enum**

| 값 | 설명 |
|---|---|
| `HIGH` | 상 (어려움) |
| `MEDIUM` | 중 |
| `LOW` | 하 (쉬움) |

`computedVideoCount`, `computedTotalDuration`은 DB 컬럼이 아닌 getter로 videos 관계를 통해 계산됩니다.

---

### 4. `videos` (영상)

```typescript
@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  youtubeVideoId: string;    // YouTube 영상 ID (URL 연결용)

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  duration: number;          // 초 단위 재생 시간

  @ManyToOne(() => User, { nullable: false })
  teacher: User;

  @ManyToOne(() => Course, { nullable: false })
  course: Course;
}
```

---

### 5. `enrollments` (수강 신청)

```typescript
@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Course)
  course: Course;

  @Column({ nullable: false, default: false })
  isCompleted: boolean;

  @CreateDateColumn()
  enrolledAt: Date;

  @Column({ nullable: true })
  completedAt: Date;
}
```

---

### 6. `video_watch_logs` (영상 시청 이력) — **신규**

```typescript
@Entity('video_watch_logs')
export class VideoWatchLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToOne(() => Video, { nullable: false })
  video: Video;

  // 마지막으로 시청한 위치 (초 단위) — 이어보기 기준
  @Column({ name: 'watched_duration', type: 'int', default: 0 })
  watchedDuration: number;

  // 해당 영상을 끝까지(90% 이상) 시청했는지 여부
  @Column({ name: 'is_completed', type: 'boolean', default: false })
  isCompleted: boolean;

  @Column({ name: 'last_watched_at', type: 'timestamptz' })
  lastWatchedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // 동일 (user, video) 쌍은 하나만 존재
  // UNIQUE(user_id, video_id)
}
```

> **이어보기 로직:** 프론트에서 주기적으로(30초마다) `PATCH /videos/:id/progress` 호출 → `watchedDuration` 갱신. 페이지 재진입 시 해당 값을 YouTube Player `seekTo()`에 전달.

> **80% 수강 판정:** 코스 내 전체 영상 수 대비 `isCompleted = true`인 영상 수 비율로 계산. 80% 이상이면 리뷰 작성 허용.

---

### 7. `cart_items` (장바구니) — **신규**

```typescript
@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Course, { nullable: false })
  course: Course;

  @CreateDateColumn({ name: 'added_at' })
  addedAt: Date;

  // UNIQUE(user_id, course_id) — 같은 코스 중복 담기 방지
}
```

> 장바구니 항목은 결제 완료 또는 사용자가 직접 삭제하기 전까지 영구 유지됩니다. 결제 성공 시 해당 `cart_items` 레코드는 삭제되고 `order_items`로 이전됩니다.

---

### 8. `orders` (주문) — **신규**

```typescript
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  // 토스페이먼츠 paymentKey — 결제 승인 후 채워짐
  @Column({ name: 'toss_payment_key', nullable: true, unique: true })
  tossPaymentKey: string;

  // 결제 요청 시 클라이언트가 생성하는 고유 주문 ID
  @Column({ name: 'toss_order_id', unique: true })
  tossOrderId: string;

  @Column({ name: 'total_amount', type: 'int' })
  totalAmount: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;     // PENDING | PAID | CANCELLED | REFUNDED | PARTIAL_REFUNDED

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => PaymentLog, (log) => log.order, { cascade: true })
  paymentLogs: PaymentLog[];

  @CreateDateColumn({ name: 'ordered_at' })
  orderedAt: Date;

  @Column({ name: 'paid_at', nullable: true, type: 'timestamptz' })
  paidAt: Date;
}
```

**OrderStatus enum**

| 값 | 설명 |
|---|---|
| `PENDING` | 결제 요청 중 (토스 결제창 이탈 등) |
| `PAID` | 결제 완료 |
| `CANCELLED` | 사용자 취소 또는 강의 폐강 취소 |
| `REFUNDED` | 전액 환불 완료 |
| `PARTIAL_REFUNDED` | 부분 환불 완료 |

---

### 9. `order_items` (주문 상세) — **신규**

```typescript
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Course)
  course: Course;

  // 구매 시점 가격 스냅샷 (이후 가격 변동과 무관하게 보존)
  @Column({ name: 'price_at_purchase', type: 'int' })
  priceAtPurchase: number;

  // 해당 항목 취소/환불 여부
  @Column({ name: 'is_refunded', type: 'boolean', default: false })
  isRefunded: boolean;

  @Column({ name: 'refunded_at', nullable: true, type: 'timestamptz' })
  refundedAt: Date;
}
```

---

### 10. `payment_logs` (결제 이벤트 로그) — **신규**

```typescript
@Entity('payment_logs')
export class PaymentLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.paymentLogs)
  order: Order;

  // PAYMENT_REQUESTED | PAYMENT_CONFIRMED | PAYMENT_FAILED
  // CANCEL_REQUESTED | CANCEL_CONFIRMED | REFUND_CONFIRMED
  @Column({ name: 'event_type', type: 'enum', enum: PaymentEventType })
  eventType: PaymentEventType;

  @Column({ type: 'int' })
  amount: number;

  // 토스 API 응답 원문 전체 보관 (감사 추적용)
  @Column({ name: 'toss_raw_response', type: 'jsonb', nullable: true })
  tossRawResponse: object;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

> 토스페이먼츠는 결제 승인/취소 처리만 담당하고, 모든 트랜잭션 원문은 `payment_logs.tossRawResponse`(JSONB)에 원본 그대로 저장합니다.

---

### 11. `reviews` (리뷰) — **신규**

```typescript
@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToOne(() => Course, { nullable: false })
  course: Course;

  @Column({ type: 'smallint' })
  rating: number;           // 1~5점

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // UNIQUE(user_id, course_id) — 코스당 리뷰 1개 제한
}
```

> **작성 조건 검증:** 리뷰 작성 API 호출 시 서버에서 `video_watch_logs.isCompleted = true` 영상 수 / 전체 영상 수 ≥ 0.8 여부를 확인하고, 조건 미달 시 `403 Forbidden` 반환.

---

### 12. `bookmarks` (영상 북마크) — **신규**

```typescript
@Entity('bookmarks')
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Video, { nullable: false, onDelete: 'CASCADE' })
  video: Video;

  // 북마크를 찍은 영상 재생 위치 (초 단위)
  @Column({ name: 'position_sec', type: 'int' })
  positionSec: number;

  // 선택적 메모
  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

| 관계 | 설명 |
|---|---|
| User 1:N Course | 한 선생님이 여러 코스 생성 |
| User 1:N Video | 한 선생님이 여러 영상 등록 |
| Course 1:N Video | 한 코스에 여러 영상 포함 |
| User 1:N Enrollment | 한 학생이 여러 코스 수강 신청 |
| Course 1:N Enrollment | 한 코스에 여러 학생 등록 |
| User 1:N RefreshToken | 한 유저의 토큰 복수 발급 지원 |
| User 1:N CartItem | 장바구니 항목 (결제 전 유지) |
| User 1:N Order | 주문 이력 |
| Order 1:N OrderItem | 주문 1건에 여러 코스 포함 |
| Order 1:N PaymentLog | 결제·취소·환불 이벤트 로그 |
| User 1:N VideoWatchLog | 영상별 시청 위치 이력 |
| User 1:N Review | 수강 완료(80%) 후 리뷰 |
| User 1:N Bookmark | 영상 특정 시점 북마크 |
