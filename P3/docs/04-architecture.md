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

### 인프라

| 기술 | 역할 |
|---|---|
| **PostgreSQL** | 관계형 데이터베이스 |
| **YouTube Data API** | 영상 ID 기반 외부 연동 |

---

## 프로젝트 디렉토리 구조

```
solving-meal/
├── client/                         # 프론트엔드 (React + Vite)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                 # 라우터 설정
│       ├── index.css               # 글로벌 스타일
│       ├── api/                    # API 클라이언트
│       │   ├── ApiClient.ts        # Axios 인스턴스 (인터셉터)
│       │   ├── AuthApi.ts          # 인증 API
│       │   ├── CourseApi.ts        # 코스 API
│       │   ├── EnrollmentApi.ts    # 수강 API
│       │   ├── UserApi.ts          # 유저 API
│       │   └── VideoApi.ts         # 영상 API
│       ├── components/
│       │   ├── course/
│       │   │   └── CourseCard.tsx  # 코스 카드 컴포넌트
│       │   └── layout/
│       │       └── Navbar.tsx      # 공통 네비게이션
│       ├── pages/
│       │   ├── Home.tsx            # 메인 홈
│       │   ├── Courses.tsx         # 코스 목록
│       │   ├── CourseDetail.tsx    # 코스 상세
│       │   ├── CreateCourse.tsx    # 코스 생성 (TEACHER)
│       │   ├── RegisterVideo.tsx   # 영상 등록 (TEACHER)
│       │   ├── TeacherCourse.tsx   # 선생님 코스 관리
│       │   ├── MyCourses.tsx       # 내 수강 목록
│       │   ├── VideoDetail.tsx     # 영상 시청
│       │   ├── Login.tsx           # 로그인
│       │   ├── Signup.tsx          # 회원가입
│       │   └── Profile.tsx         # 프로필
│       ├── store/
│       │   └── AuthStore.ts        # Zustand 인증 상태
│       └── types/                  # TypeScript 타입 정의
│
└── server/                         # 백엔드 (NestJS)
    ├── package.json
    ├── nest-cli.json
    ├── .env.example
    └── src/
        ├── main.ts                 # 서버 진입점 (포트 8080)
        ├── app.module.ts           # 루트 모듈
        ├── auth/                   # 인증 모듈
        │   ├── auth.module.ts
        │   ├── auth.controller.ts
        │   ├── services/
        │   │   ├── auth.service.ts
        │   │   ├── token.service.ts
        │   │   └── refresh-token.service.ts
        │   ├── strategies/         # Passport JWT 전략
        │   ├── guards/             # JWT 가드
        │   ├── dto/
        │   └── entities/
        ├── user/                   # 유저 모듈
        ├── courses/                # 코스 모듈
        ├── videos/                 # 영상 모듈
        ├── enrollments/            # 수강 모듈
        ├── teacher/                # 선생님 모듈
        ├── cart/                   # 장바구니 모듈 (신규)
        ├── payments/               # 결제 모듈 (신규)
        ├── reviews/                # 리뷰 모듈 (신규)
        ├── bookmarks/              # 북마크 모듈 (신규)
        └── watch-logs/             # 시청 이력 모듈 (신규)
        └── common/
            ├── dto/api-response.dto.ts
            ├── enums/user-role.enum.ts
            ├── filters/exception.filter.ts
            ├── guards/roles.guard.ts
            └── decorators/
```

---

## 시스템 아키텍처

```
┌────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React SPA (Vite, port 5173)                         │   │
│  │  ┌───────────┐  ┌───────────┐  ┌─────────────────┐  │   │
│  │  │ Pages     │  │ Zustand   │  │ Axios + TanStack │  │   │
│  │  │ (React    │  │ AuthStore │  │ Query            │  │   │
│  │  │ Router)   │  │           │  │                  │  │   │
│  │  └───────────┘  └───────────┘  └────────┬────────┘  │   │
│  └───────────────────────────────────────── │ ──────────┘   │
└──────────────────────────────────────────── │ ─────────────┘
                                              │ HTTP /api/v1
┌──────────────────────────────────────────── │ ─────────────┐
│  NestJS Server (port 8080)                  │              │
│  ┌────────────────────────────────────────▼────────────┐  │
│  │  Global Prefix: /api/v1                             │  │
│  │  GlobalPipe: ValidationPipe                         │  │
│  │  GlobalFilter: HttpExceptionFilter + AllException   │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │  JwtAccessGuard → RolesGuard → Controller           │  │
│  │  → Service → Repository → TypeORM                   │  │
│  └──────────────────────────────┬──────────────────────┘  │
└─────────────────────────────────│───────────────────────── ┘
                                  │ TCP
┌─────────────────────────────────│──────────────────────────┐
│  PostgreSQL                     ▼                          │
│  users │ courses │ videos │ enrollments │ refresh_tokens        │
│  cart_items │ orders │ order_items │ payment_logs          │
│  video_watch_logs │ reviews │ bookmarks                    │
└────────────────────────────────────────────────────────────┘
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

## 개발 서버 구성

| 서버 | 포트 | 명령어 |
|---|---|---|
| 프론트엔드 (Vite) | 5173 | `cd client && npm run dev` |
| 백엔드 (NestJS) | 8080 | `cd server && npm run start:dev` |
| PostgreSQL | 5432 | 로컬 설치 또는 Docker |
| Swagger 문서 | 8080/api/docs | 서버 실행 후 자동 생성 |
