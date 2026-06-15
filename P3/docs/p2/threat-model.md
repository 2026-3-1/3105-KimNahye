# 위협 모델 (STRIDE) — Solving Meal P2

## 분석 대상

인증 흐름 (회원가입 → 로그인 → API 접근 → 토큰 갱신)

---

## STRIDE 분석

### S — Spoofing (사칭)

| 위협 | 대응 |
|---|---|
| 타인의 JWT를 탈취해 API 호출 | 액세스 토큰 1시간 만료 + HTTPS 전송 |
| 리프레시 토큰 재사용 | RTR: 1회 사용 후 폐기, DB에서 검증 |
| 비밀번호 브루트포스 | Rate Limiting (60req/60s 전역) |

### T — Tampering (변조)

| 위협 | 대응 |
|---|---|
| JWT 페이로드 변조 | 서버 시크릿으로 서명 검증 (HS256) |
| 결제 금액 변조 | 서버에서 DB 가격으로 재검증 |
| 요청 바디 불필요 필드 삽입 | ValidationPipe whitelist: true |

### R — Repudiation (부인)

| 위협 | 대응 |
|---|---|
| "나는 로그인한 적 없다" | Winston 구조화 로그 + 타임스탬프 |
| 결제 기록 부인 | Payment 엔티티에 paymentKey/orderId 영구 보관 |

### I — Information Disclosure (정보 노출)

| 위협 | 대응 |
|---|---|
| 비밀번호 노출 | `select: false` + bcrypt 해싱 |
| 에러 메시지로 내부 정보 노출 | AllExceptionFilter에서 메시지 정제 |
| HTTP 헤더 정보 노출 | Helmet으로 X-Powered-By 등 제거 |

### D — Denial of Service (서비스 거부)

| 위협 | 대응 |
|---|---|
| API 무한 요청 | ThrottlerModule (전역 Rate Limiting) |
| 대용량 요청 바디 | Express 기본 1MB 제한 |

### E — Elevation of Privilege (권한 상승)

| 위협 | 대응 |
|---|---|
| STUDENT가 TEACHER API 호출 | RolesGuard + `@Roles()` 데코레이터 |
| 토큰 없이 보호 라우트 접근 | JwtAccessGuard에서 401 반환 |
| 타인 리소스 수정 | 서비스 레이어에서 소유자(userId) 검증 |

---

## 신뢰 경계

```
[Browser] --HTTPS--> [NestJS API] --TCP--> [PostgreSQL]
                          |
                          └--TCP--> [Redis]
                          |
                          └--HTTPS--> [Toss Payments API]
                          |
                          └--SMTP--> [Email Server]
```

- Browser ↔ API: HTTPS 필수 (운영 환경)
- API ↔ DB/Redis: 내부 네트워크 (Docker 네트워크)
- API ↔ 외부 서비스: 시크릿 키 환경변수로 관리

---

## 잔존 위험

| 위험 | 심각도 | 수용 이유 |
|---|---|---|
| 로그인 엔드포인트 개별 Rate Limit 미적용 | 낮음 | 전역 Rate Limit으로 1차 방어 중, P3에서 강화 예정 |
| Refresh Token DB 탈취 | 중간 | DB 접근 자체가 내부 네트워크로 제한됨 |
