# P2 구현 체크리스트

---

## Phase 6 — 장바구니 (Cart)

### 백엔드

- [x] `CartItem` 엔티티 (`src/cart/entities/cart-item.entity.ts`) — UNIQUE(user, course) 제약
- [x] `ICartRepository` 인터페이스 (`src/cart/interfaces/cart-repository.interface.ts`)
- [x] `CartRepository` 구현체 (`src/cart/cart.repository.ts`)
- [x] `AddToCartDto` DTO (`src/cart/dto/add-to-cart.dto.ts`)
- [x] `CartResponse` / `CartItemResponse` DTO (`src/cart/dto/cart-response.dto.ts`)
- [x] `CartService` — getCart, addToCart, removeFromCart, clearCart (`src/cart/cart.service.ts`)
  - [x] 이미 수강 중인 강좌 400 처리
  - [x] 이미 장바구니에 담긴 강좌 409 처리
- [x] `CartController` (`src/cart/cart.controller.ts`)
  - [x] `GET /cart` — 내 장바구니 목록
  - [x] `POST /cart` — 코스 추가
  - [x] `DELETE /cart/:courseId` — 항목 개별 삭제
  - [x] `DELETE /cart` — 전체 비우기
- [x] `CartModule` 등록 (`src/cart/cart.module.ts`)
- [x] `AppModule`에 `CartModule` 등록

### 프론트엔드

- [x] `CartApi.ts` — getCart, addToCart, removeFromCart, clearCart (`src/api/CartApi.ts`)
- [x] `Cart.tsx` 페이지 — 장바구니 목록 UI, 개별/전체 삭제 (`src/pages/Cart.tsx`)
- [x] `Cart.module.css` 스타일 (`src/pages/Cart.module.css`)
- [x] `CourseDetail.tsx`에 "🛒 장바구니 담기" 버튼 추가
- [x] `App.tsx`에 `/cart` 라우트 추가
- [x] `Navbar.tsx`에 장바구니 링크 추가 (STUDENT 전용)

---

## Phase 8 — 수강 이력 & 이어보기 (WatchLog)

### 백엔드

- [x] `VideoWatchLog` 엔티티 (`src/videos/entities/video-watch-log.entity.ts`) — UNIQUE(user, video)
- [x] `IWatchLogRepository` 인터페이스 (`src/videos/interfaces/watch-log-repository.interface.ts`)
- [x] `WatchLogRepository` — findByUserAndVideo, upsert, countCompleted (`src/videos/watch-log.repository.ts`)
- [x] `UpdateProgressDto` DTO (`src/videos/dto/update-progress.dto.ts`)
- [x] `ProgressResponseDto` DTO (`src/videos/dto/progress-response.dto.ts`)
- [x] `VideoService`에 `updateProgress`, `getProgress` 메서드 추가
- [x] `VideoController`에 엔드포인트 추가
  - [x] `PATCH /videos/:id/progress` — 시청 위치 upsert (30초마다 호출)
  - [x] `GET /videos/:id/progress` — 마지막 시청 위치 조회 (이어보기)
- [x] `VideoModule`에 `VideoWatchLog` 및 `WatchLogRepository` 등록

### 프론트엔드

- [x] `WatchLogApi.ts` — updateProgress, getProgress (`src/api/WatchLogApi.ts`)
- [x] `VideoDetail.tsx`에 30초 인터벌 progress 저장 구현
- [x] `VideoDetail.tsx`에 페이지 진입 시 이어보기 위치 조회 + iframe `start` 파라미터 적용

---

## Phase 9 — 리뷰 (Review)

### 백엔드

- [x] `Review` 엔티티 (`src/reviews/entities/review.entity.ts`) — UNIQUE(user, course)
- [x] `IReviewRepository` 인터페이스 (`src/reviews/interfaces/review-repository.interface.ts`)
- [x] `ReviewRepository` 구현체 (`src/reviews/review.repository.ts`)
- [x] `CreateReviewDto`, `UpdateReviewDto`, `ReviewResponse` DTO
- [x] `ReviewService` (`src/reviews/review.service.ts`)
  - [x] `getReviews` — 코스 리뷰 목록
  - [x] `createReview` — 80% 수강 검증 (`VideoWatchLog.isCompleted` 기반) + 중복 409
  - [x] `updateReview` — 본인 리뷰만 수정
  - [x] `deleteReview` — 본인 리뷰만 삭제
- [x] `ReviewController` (`src/reviews/review.controller.ts`)
  - [x] `GET /courses/:courseId/reviews` — 리뷰 목록 (공개)
  - [x] `POST /courses/:courseId/reviews` — 리뷰 작성 (인증 필요)
  - [x] `PUT /courses/:courseId/reviews/:reviewId` — 리뷰 수정
  - [x] `DELETE /courses/:courseId/reviews/:reviewId` — 리뷰 삭제
- [x] `ReviewModule` 등록 (`src/reviews/review.module.ts`)
- [x] `AppModule`에 `ReviewModule` 등록

### 프론트엔드

- [x] `ReviewApi.ts` — getCourseReviews, createReview, updateReview, deleteReview (`src/api/ReviewApi.ts`)
- [x] `CourseDetail.tsx`에 리뷰 섹션 추가
  - [x] 리뷰 목록 + 별점 표시
  - [x] 리뷰 작성 폼 (별점 선택 + 텍스트)
  - [x] 본인 리뷰 삭제 버튼
  - [x] 평균 별점 히어로 영역 표시

---

## Phase 10 — 북마크 (Bookmark)

### 백엔드

- [x] `Bookmark` 엔티티 (`src/bookmarks/entities/bookmark.entity.ts`)
- [x] `IBookmarkRepository` 인터페이스 (`src/bookmarks/interfaces/bookmark-repository.interface.ts`)
- [x] `BookmarkRepository` 구현체 (`src/bookmarks/bookmark.repository.ts`)
- [x] `CreateBookmarkDto`, `UpdateBookmarkDto`, `BookmarkResponse` DTO
- [x] `BookmarkService` (`src/bookmarks/bookmark.service.ts`)
  - [x] `getBookmarks` — 영상의 내 북마크 목록
  - [x] `createBookmark` — 북마크 추가
  - [x] `updateBookmark` — 메모 수정 (본인만)
  - [x] `deleteBookmark` — 삭제 (본인만)
- [x] `BookmarkController` (`src/bookmarks/bookmark.controller.ts`)
  - [x] `GET /videos/:videoId/bookmarks` — 내 북마크 목록
  - [x] `POST /videos/:videoId/bookmarks` — 북마크 추가
  - [x] `PATCH /bookmarks/:bookmarkId` — 메모 수정
  - [x] `DELETE /bookmarks/:bookmarkId` — 삭제
- [x] `BookmarkModule` 등록 (`src/bookmarks/bookmark.module.ts`)
- [x] `AppModule`에 `BookmarkModule` 등록

### 프론트엔드

- [x] `BookmarkApi.ts` — getBookmarks, addBookmark, updateBookmark, deleteBookmark (`src/api/BookmarkApi.ts`)
- [x] `VideoDetail.tsx`에 북마크 기능 추가
  - [x] "현재 위치 북마크" 버튼 (메모 입력 포함)
  - [x] 북마크 사이드패널 — 위치(초) + 메모 목록
  - [x] 북마크 삭제 버튼

---

## Phase 12 — ProtectedRoute (라우트 보호)

### 프론트엔드

- [x] `ProtectedRoute` 컴포넌트 (`src/components/ProtectedRoute.tsx`)
  - [x] 미로그인 시 `/login` 리다이렉트
  - [x] role 불일치 시 `/` 리다이렉트
- [x] `App.tsx`에 ProtectedRoute 적용
  - [x] `/my-courses`, `/profile`, `/cart`, `/videos/:id` — 로그인 필요
  - [x] `/courses/create`, `/teacher`, `/videos/register/:courseId` — TEACHER 전용

---

## 미구현 항목 (Phase 7 — 결제)

> 토스페이먼츠 실제 SDK 연동이 필요하여 이번 구현에서 제외

- [ ] `Order` / `OrderItem` / `PaymentLog` 엔티티
- [ ] `POST /payments/prepare` — 주문 생성
- [ ] `POST /payments/confirm` — 토스 결제 승인 확정
- [ ] `POST /payments/cancel` — 취소/환불
- [ ] `GET /payments/orders` — 주문 이력
- [ ] `Cart.tsx`에서 토스 결제창 연동
- [ ] `PaymentSuccess.tsx` / `PaymentFail.tsx` 페이지
- [ ] `OrderHistory.tsx` 페이지
