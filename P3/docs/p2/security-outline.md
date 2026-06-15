# P2 보안 설계 — Solving Meal

## 인증 아키텍처

### JWT 이중 토큰 전략

```
Client                    Server
  |                          |
  |--- POST /auth/login ---→ |
  |                          | ① 비밀번호 bcrypt 검증
  |                          | ② Access Token (1h) 발급
  |                          | ③ Refresh Token (7d) 발급 + DB 저장
  |←-- { accessToken, ------|
  |      refreshToken }      |
  |                          |
  |--- API 요청 (Bearer) --→ |  ④ JwtAccessGuard 검증
  |                          |
  |--- POST /auth/refresh -→ | ⑤ RTR: 기존 토큰 폐기 + 새 토큰 발급
```

### RTR (Refresh Token Rotation)

- Refresh Token은 1회 사용 후 즉시 폐기 (`deleteOne`)
- 재발급 시 새 Refresh Token을 DB에 저장
- 로그아웃 시 해당 유저의 모든 Refresh Token 삭제 (`deleteAll`)
- 만료/폐기된 토큰은 스케줄러가 매일 자정 자동 정리

---

## 역할 기반 접근 제어 (RBAC)

| 역할 | 권한 |
|---|---|
| `STUDENT` | 코스 조회, 수강 신청, 리뷰 작성, 북마크, 결제 |
| `TEACHER` | STUDENT 권한 + 코스 생성/수정, 영상 등록 |
| `ADMIN` | (예정) 전체 관리 |

### Guard 체인

```
Request → JwtAccessGuard (토큰 검증) → RolesGuard (역할 검증) → Controller
```

---

## OWASP Top 10 대응 현황

| # | 항목 | 대응 방법 | 상태 |
|---|---|---|---|
| A01 | 접근 제어 실패 | JwtAccessGuard + RolesGuard | ✅ |
| A02 | 암호화 실패 | bcrypt 해싱, HTTPS(운영) | ✅ |
| A03 | 인젝션 | TypeORM 파라미터 바인딩 | ✅ |
| A04 | 안전하지 않은 설계 | DTO whitelist, ValidationPipe | ✅ |
| A05 | 보안 설정 오류 | Helmet 헤더, CORS 제한 | ✅ |
| A06 | 취약한 컴포넌트 | npm audit 정기 실행 | 🔄 |
| A07 | 인증 실패 | RTR, 토큰 만료 1h | ✅ |
| A08 | 무결성 실패 | 결제 금액 서버 검증 | ✅ |
| A09 | 로깅 부족 | Winston 구조화 로그 | ✅ |
| A10 | SSRF | 외부 URL 직접 입력 불가 | ✅ |

---

## 시크릿 관리

- 모든 시크릿은 `.env` 파일로 관리 (Git에 커밋 금지)
- 운영 환경: GitHub Actions Secrets → SSH로 서버 전달
- `.env.example` 파일로 필요한 환경변수 목록 공유

### 필수 시크릿 목록

```
JWT_ACCESS_SECRET=<32자 이상 랜덤>
JWT_REFRESH_SECRET=<32자 이상 랜덤>
DATABASE_URL=<PostgreSQL URL>
REDIS_URL=<Redis URL>
TOSS_SECRET_KEY=<토스페이먼츠 시크릿>
TOSS_WEBHOOK_SECRET=<웹훅 시크릿>
SMTP_HOST=<SMTP 서버>
SMTP_USER=<이메일>
SMTP_PASS=<앱 비밀번호>
```

---

## Rate Limiting

- 전역: 60초당 60회 (`ThrottlerModule`)
- 로그인 엔드포인트는 전역 제한 그대로 적용 (추후 개별 제한 강화 예정)
