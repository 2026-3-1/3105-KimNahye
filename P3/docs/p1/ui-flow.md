# 프론트 페이지 흐름 (와이어프레임) — Solving Meal

## 페이지 목록 및 라우트

| 라우트 | 컴포넌트 | 접근 권한 |
|---|---|---|
| `/` | Home | 누구나 |
| `/courses` | Courses | 누구나 |
| `/courses/:id` | CourseDetail | 누구나 |
| `/login` | Login | 비로그인만 |
| `/signup` | Signup | 비로그인만 |
| `/my-courses` | MyCourses | 로그인 필요 |
| `/profile` | Profile | 로그인 필요 |
| `/cart` | Cart | 로그인 필요 |
| `/videos/:id` | VideoDetail | 로그인 필요 |
| `/courses/create` | CreateCourse | TEACHER만 |
| `/teacher` | TeacherCourses | TEACHER만 |
| `/teacher/edit/:id` | EditCourse | TEACHER만 |
| `/videos/register/:courseId` | RegisterVideo | TEACHER만 |
| `/payment/success` | PaymentSuccess | 로그인 필요 |
| `/payment/fail` | PaymentFail | 누구나 |

---

## 주요 사용자 흐름

### 학습자 흐름

```
[홈] → [코스 목록] → [코스 상세]
                          ↓
                    [장바구니 담기]
                          ↓
                       [장바구니]
                          ↓
                    [토스 결제창]
                          ↓
                   [결제 성공/실패]
                          ↓
                   [내 코스 목록]
                          ↓
                    [영상 시청]
```

### 선생님 흐름

```
[로그인] → [내 강의 관리] → [코스 생성]
                                ↓
                          [영상 등록]
                                ↓
                          [코스 수정]
```

### 인증 흐름

```
[비로그인]
    ↓
[보호 라우트 접근]
    ↓
[/login 리다이렉트]
    ↓
[로그인 성공] → [원래 페이지 or 홈]

[TEACHER 아닌 유저가 /courses/create 접근]
    ↓
[/ 리다이렉트]
```

---

## 공통 레이아웃

```
┌─────────────────────────────────────┐
│  Navbar                              │
│  [로고] [코스] [내 코스] [장바구니]  │
│         [로그인/로그아웃] [프로필]   │
├─────────────────────────────────────┤
│                                     │
│           페이지 컨텐츠              │
│                                     │
└─────────────────────────────────────┘
```

### Navbar 역할별 메뉴 분기

| 상태 | 노출 메뉴 |
|---|---|
| 비로그인 | 코스, 로그인, 회원가입 |
| STUDENT 로그인 | 코스, 내 코스, 장바구니, 프로필, 로그아웃 |
| TEACHER 로그인 | 코스, 내 강의, 프로필, 로그아웃 |
