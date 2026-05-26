# Solving Meal — 프론트엔드 구조

## 기술 선택 이유

| 기술 | 선택 이유 |
|---|---|
| React 19 | 최신 훅 + Suspense 지원 |
| Vite 8 | 빠른 HMR, 경량 빌드 |
| Zustand | Redux 대비 보일러플레이트 최소, persist 미들웨어로 토큰 유지 |
| TanStack Query | 서버 상태 캐싱·갱신·에러 처리 자동화 |
| CSS Modules | 전역 충돌 없는 컴포넌트 단위 스타일 |

---

## 라우팅 구조

```
/                        → Home.tsx
/courses                 → Courses.tsx
/courses/create          → CreateCourse.tsx      (TEACHER)
/courses/:id             → CourseDetail.tsx
/teacher                 → TeacherCourses.tsx     (TEACHER)
/my-courses              → MyCourses.tsx
/videos/register/:courseId → RegisterVideo.tsx   (TEACHER)
/videos/:id              → VideoDetail.tsx
/cart                    → Cart.tsx              (신규)
/payment/success         → PaymentSuccess.tsx    (신규)
/payment/fail            → PaymentFail.tsx       (신규)
/orders                  → OrderHistory.tsx      (신규)
/login                   → Login.tsx
/signup                  → Signup.tsx
/profile                 → Profile.tsx
```

---

## 인증 상태 관리 (Zustand)

```typescript
// store/AuthStore.ts
type AuthState = {
  user: UserProfile | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user, accessToken, refreshToken) => void
  setUser: (user) => void
  logout: () => void
}
```

- `persist` 미들웨어 → `localStorage('auth-storage')`에 상태 직렬화
- `refreshToken`은 별도 `localStorage.setItem('refreshToken', ...)` 저장
- `accessToken`은 Zustand 메모리 상태로만 관리
- 앱 초기화 시 `isAuthenticated`이면 `/user/me` 호출해 user 갱신

---

## API 클라이언트 구조

```typescript
// api/ApiClient.ts — Axios 인스턴스
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

// Request 인터셉터: accessToken 자동 주입
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response 인터셉터: 401 시 refreshToken으로 재발급
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      // POST /auth/refresh → 새 토큰 → 원래 요청 재시도
    }
  }
)
```

---

## API 모듈

| 파일 | 담당 API |
|---|---|
| `AuthApi.ts` | register, login, logout, refresh |
| `CourseApi.ts` | getCourses, getCourse, createCourse, getMyCourses, getTeacherCourses |
| `EnrollmentApi.ts` | enroll |
| `VideoApi.ts` | getVideoDetail, createVideo |
| `UserApi.ts` | getMyInfo, updateProfile |
| `CartApi.ts` | getCart, addToCart, removeFromCart, clearCart **(신규)** |
| `PaymentApi.ts` | prepareOrder, confirmPayment, cancelPayment, getOrders **(신규)** |
| `ReviewApi.ts` | getCourseReviews, createReview, updateReview, deleteReview **(신규)** |
| `BookmarkApi.ts` | getBookmarks, addBookmark, updateBookmark, deleteBookmark **(신규)** |
| `WatchLogApi.ts` | updateProgress, getProgress **(신규)** |

---

## 페이지별 주요 동작

### Courses.tsx (코스 목록)
- 카테고리·난이도·필요도구·재생시간 필터 UI
- `GET /courses/list?category=...&difficulty=...` 쿼리
- `CourseCard` 컴포넌트 그리드 렌더링

### CourseDetail.tsx (코스 상세)
- `GET /courses/:id` → 영상 목록, 선생님 정보, 총 재생시간 표시
- 수강 신청 버튼 → `POST /courses/:courseId/enroll`

### VideoDetail.tsx (영상 시청)
- `GET /videos/:id` → 수강 여부 확인
- YouTube embed iframe 렌더링 (`youtubeVideoId` 활용)
- 재생 중 30초마다 `PATCH /videos/:id/progress` 호출 → 시청 위치 저장
- 페이지 진입 시 `GET /videos/:id/progress` → `seekTo(watchedDuration)` 이어보기
- 북마크 버튼 → 현재 재생 위치로 `POST /videos/:videoId/bookmarks`
- 북마크 목록 사이드패널 표시

### Cart.tsx (장바구니) — **신규**
- `GET /cart` → 담긴 코스 목록 + 총 금액
- 항목별 삭제, 전체 비우기
- "결제하기" 클릭 → `POST /payments/prepare` → 토스 결제창 오픈 (`TossPayments SDK`)

### PaymentSuccess.tsx / PaymentFail.tsx — **신규**
- 토스 결제 완료 후 리다이렉트 도착 페이지
- `PaymentSuccess`: URL 파라미터(`paymentKey`, `orderId`, `amount`)를 받아 `POST /payments/confirm` 호출 → 성공 시 수강 시작 안내
- `PaymentFail`: 실패 사유 표시 + 장바구니로 돌아가기

### OrderHistory.tsx (주문 이력) — **신규**
- `GET /payments/orders` → 주문 목록
- 주문 상세 → 결제 로그 타임라인 표시
- 환불 버튼 → `POST /payments/cancel`

### CreateCourse.tsx (코스 생성, TEACHER)
- 카테고리, 난이도, 필요 도구 입력 폼
- `POST /teacher` 호출

### RegisterVideo.tsx (영상 등록, TEACHER)
- YouTube 영상 ID, 제목, 재생 시간 입력
- `POST /videos` → courseId 연결

---

## 타입 정의

```
types/
├── auth/
│   ├── LoginRequest.ts       { email, password }
│   ├── LoginResponseData.ts  { accessToken, refreshToken }
│   ├── RegisterRequest.ts    { email, password, nickname, role }
│   ├── RefreshResponseData.ts
│   └── SignupResponseData.ts
├── course/
│   ├── CourseListItem.ts
│   ├── CourseDetail.ts
│   ├── CourseTeacher.ts
│   ├── CourseVideo.ts
│   ├── CreateCourseRequest.ts
│   └── GetCourseParams.ts
├── enrollment/
│   └── EnrollmentData.ts
├── video/
│   ├── VideoData.ts
│   ├── VideoDetail.ts
│   └── RegisterVideoRequest.ts
├── user/
│   ├── UserProfile.ts
│   ├── UpdateUserRequest.ts
│   └── UpdateUserResponse.ts
└── ApiResponse.ts            { statusCode, message, data }
```

---

## 환경 변수 (client/.env)

```env
VITE_API_URL=http://localhost:8080/api/v1
```
