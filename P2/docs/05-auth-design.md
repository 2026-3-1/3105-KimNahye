# Solving Meal — 인증 설계

## 개요

JWT 이중 토큰 방식(Access Token + Refresh Token)을 사용합니다. Refresh Token Rotation(RTR) 전략을 적용해 보안을 강화합니다.

---

## 토큰 구조

| 항목 | Access Token | Refresh Token |
|---|---|---|
| 만료 시간 | 1시간 (프로덕션 5분) | 7일 (프로덕션 1시간) |
| 시크릿 | `JWT_SECRET_KEY` | `JWT_REFRESH_SECRET_KEY` |
| Payload type | `'access'` | `'refresh'` |
| 저장 위치 | Zustand (메모리) | localStorage |
| 사용 목적 | API 요청 인증 | Access Token 재발급 |

### JWT Payload

```typescript
interface JwtPayload {
  sub: string;       // 유저 UUID
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
}
```

---

## 인증 흐름

### 로그인

```
Client           Server           DB
  │                │               │
  │─ POST /auth/login ────────────►│
  │                │               │
  │                │─ findByEmail ─►│
  │                │◄─ User ───────│
  │                │               │
  │                │ validatePassword (bcrypt.compare)
  │                │               │
  │                │ generateTokens()
  │                │  └─ accessToken (1h)
  │                │  └─ refreshToken (7d)
  │                │               │
  │                │─ save refreshToken ──►│
  │◄─ { accessToken, refreshToken } ──────│
  │                │               │
  │ localStorage.setItem('refreshToken', ...)
  │ Zustand: { accessToken, isAuthenticated: true }
```

### 토큰 재발급 (RTR)

```
1. API 요청 → 401 응답
2. Axios 인터셉터 → POST /auth/refresh (refreshToken 헤더 전송)
3. JwtRefreshGuard → RefreshToken Strategy
4. DB에서 해당 refreshToken 조회 (isRevoked, isExpired 확인)
5. 유효하면 → 신규 accessToken + refreshToken 발급
6. 기존 refreshToken 레코드 삭제 (deleteOne)
7. 신규 refreshToken 저장
8. 클라이언트에 새 토큰 반환
9. 원래 API 요청 재시도
```

RTR(Refresh Token Rotation) 방식 덕분에 리프레시 토큰이 1회 사용 후 폐기되어 토큰 탈취 시 재사용 불가합니다.

### 로그아웃

```
1. POST /auth/logout (accessToken 필요)
2. RefreshTokenService.deleteAll(userId)
   → 해당 유저의 refresh_tokens 레코드 전체 삭제
3. 클라이언트: Zustand/localStorage 토큰 제거
```

---

## Guards & Strategies

### JwtAccessGuard
- `@UseGuards(JwtAccessGuard)` 적용
- `Authorization: Bearer <accessToken>` 헤더 검증
- 검증 성공 시 `req.user`에 유저 정보 주입

### JwtRefreshGuard
- Refresh Token 전용 가드
- `/auth/refresh` 엔드포인트에만 적용

### RolesGuard
- `@Roles(UserRole.TEACHER)` 데코레이터와 함께 사용
- 특정 역할(TEACHER)만 접근 가능한 엔드포인트 보호
- 현재 영상 등록(`POST /videos`)에 적용

---

## 사용자 역할별 접근 권한

| 기능 | STUDENT | TEACHER | ADMIN |
|---|---|---|---|
| 코스 목록/상세 조회 | ✓ | ✓ | ✓ |
| 수강 신청 | ✓ | ✓ | ✓ |
| 내 수강 목록 | ✓ | ✓ | ✓ |
| 영상 상세 조회 | ✓ | ✓ | ✓ |
| 코스 생성 | ✗ | ✓ | ✓ |
| 영상 등록 | ✗ | ✓ | ✓ |
| 선생님 코스 관리 | ✗ | ✓ | ✓ |

---

## 보안 고려사항

| 항목 | 구현 내용 |
|---|---|
| 비밀번호 해싱 | bcrypt, saltRounds=10 (`@BeforeInsert` 자동 처리) |
| 비밀번호 조회 차단 | `@Column({ select: false })` — 기본 쿼리에서 제외 |
| 토큰 시크릿 분리 | Access/Refresh 시크릿 키 별도 환경변수 |
| 토큰 type 구분 | Payload에 `type: 'access'|'refresh'` 포함 |
| Refresh Token DB 관리 | 로그아웃 시 전체 삭제, RTR으로 단일 사용 |
| CORS | `origin: true` (현재 전체 허용 — 프로덕션 시 도메인 제한 필요) |

---

## 환경 변수 (.env)

```env
NODE_ENV=dev

DATABASE_URL=postgresql://user:password@localhost:5432/solving_meal

JWT_SECRET_KEY=             # openssl rand -base64 32 권장
JWT_REFRESH_SECRET_KEY=     # openssl rand -base64 32 권장
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

PORT=8080
```
