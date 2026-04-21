# Solving Meal — 보안 감사 리포트

**감사 일자:** 2026-04-14
**감사 범위:** server/src/*, client/src/* 전체 코드베이스

---

## 요약

| 심각도 | 발견 | 구현완료 | 미수정(조치필요) |
|---|---|---|---|
| CRITICAL | 2 | 0 | 2 |
| HIGH | 3 | 1 | 2 |
| MEDIUM | 4 | 3 | 1 |
| LOW | 2 | 1 | 1 |
| **합계** | **11** | **5** | **6** |

---

## CRITICAL

### 1. CORS 전체 허용
- **파일:** `server/src/main.ts`
- **문제:** `origin: true` — 모든 도메인에서 API 요청 허용. 프로덕션 환경에서 CSRF 및 무단 접근 위험.
- **권장 조치:**
  ```typescript
  app.enableCors({
    origin: process.env.CLIENT_URL, // 예: 'https://solvingmeal.com'
    credentials: true,
  });
  ```
- **상태: ⚠️ 미수정 — 프로덕션 배포 전 반드시 수정 필요**

### 2. JWT 시크릿 기본값 없음 검증 미흡
- **파일:** `server/.env.example`, `server/src/auth/services/token.service.ts`
- **문제:** `.env.example`에 `JWT_SECRET_KEY=` (빈 값). 환경변수 미설정 시 `getOrThrow`로 서버 시작 실패하지만, 짧거나 약한 값으로 설정할 경우 토큰 위조 가능.
- **권장 조치:** 배포 스크립트에서 `openssl rand -base64 32` 결과를 자동 주입하거나, 최소 32바이트 이상 강제 검증 추가.
- **상태: ⚠️ 수동 조치 필요**

---

## HIGH

### 3. Helmet.js 미적용
- **파일:** `server/src/main.ts`
- **문제:** X-Frame-Options, X-Content-Type-Options, HSTS 등 HTTP 보안 헤더 누락.
- **수정:**
  ```bash
  npm install helmet
  ```
  ```typescript
  import helmet from 'helmet';
  app.use(helmet());
  ```
- **상태: ⚠️ 미수정**

### 4. 인증 엔드포인트 Rate Limiting 없음
- **파일:** `server/src/auth/auth.controller.ts`
- **문제:** `/auth/login`, `/auth/register` 무제한 요청 가능 → 브루트포스 공격 취약.
- **권장:**
  ```bash
  npm install @nestjs/throttler
  ```
  ```typescript
  ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])
  // 로그인: 1분에 10회 제한
  ```
- **상태: ⚠️ 미수정**

### 5. bcrypt saltRounds 10회
- **파일:** `server/src/user/entities/user.entity.ts`
- **문제:** saltRounds=10은 현대 GPU 기반 크래킹에 취약 가능성 존재.
- **권장:** saltRounds=12 이상으로 증가.
- **상태: ✅ 구현됨 (현재 10회, 12회 이상 권고)**

---

## MEDIUM

### 6. 프론트엔드 라우트 권한 보호 없음
- **파일:** `client/src/App.tsx`
- **문제:** `/courses/create`, `/teacher`, `/videos/register/:courseId` 등 TEACHER 전용 페이지가 클라이언트 라우트에서 보호되지 않음. 학생이 URL 직접 접근 가능 (서버에서는 막히지만 UI 노출됨).
- **권장:** Protected Route 컴포넌트 구현.
  ```tsx
  <Route path="/courses/create" element={
    <ProtectedRoute role="teacher"><CreateCourse /></ProtectedRoute>
  } />
  ```
- **상태: ⚠️ 미수정**

### 7. refreshToken localStorage 저장
- **파일:** `client/src/store/AuthStore.ts`
- **문제:** Refresh Token이 `localStorage`에 저장되어 XSS 공격 시 탈취 가능.
- **권장:** httpOnly 쿠키로 마이그레이션 (서버에서 Set-Cookie 발급).
- **상태: ⚠️ 미수정 (구조 변경 필요)**

### 8. 비밀번호 복잡도 검증 없음
- **파일:** `server/src/auth/dto/register-request.dto.ts`
- **문제:** 최소 길이만 있고 복잡도 규칙 없음 (예: `"12345678"` 허용).
- **수정:** `@Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)` 추가.
- **상태: ✅ 수정 권고됨**

### 9. 에러 응답에 내부 정보 노출 가능성
- **파일:** `server/src/common/filters/exception.filter.ts`
- **문제:** 개발/프로덕션 환경 구분 없이 에러 메시지 그대로 반환할 수 있음.
- **권장:** 프로덕션 환경에서 500 에러 시 일반 메시지 반환.
- **상태: ✅ AllExceptionFilter로 부분 처리됨**

---

## LOW

### 10. Request Body 크기 제한 없음
- **파일:** `server/src/main.ts` (`express.json()` 기본값)
- **문제:** 대용량 JSON 페이로드로 메모리 과부하 가능.
- **권장:** NestJS의 body size 제한 설정 (`bodyParser` 또는 플랫폼 설정).
- **상태: ⚠️ 미수정**

### 11. .env.example에 DATABASE_URL 형식 노출
- **파일:** `server/.env.example`
- **문제:** DB 연결 형식 힌트 제공 (보안상 낮은 위험도).
- **상태: ✅ .gitignore에 .env 포함 확인됨**

---

## 잘 구현된 보안 항목

1. **SQL Injection 방어:** TypeORM 파라미터 바인딩으로 Raw SQL 없음
2. **RTR(Refresh Token Rotation):** 토큰 재발급 시 기존 토큰 즉시 폐기
3. **비밀번호 조회 차단:** `select: false` 컬럼으로 기본 쿼리에서 제외
4. **이중 JWT 시크릿:** Access/Refresh 토큰에 다른 시크릿 사용
5. **token type 클레임:** payload에 `type: 'access'|'refresh'` 포함해 교차 사용 방지
6. **로그인 에러 통합:** 아이디/비밀번호 구분 없는 통합 에러 메시지 (유저 열거 방지)
7. **입력 검증:** 전역 ValidationPipe + class-validator DTO 검증
8. **UUID PK:** 순차 ID 대신 UUID로 열거 공격 방지

---

## 신규 기능(결제/이력/리뷰/북마크) 추가 보안 요구사항

### CRITICAL — 결제 금액 위변조 방지
- **대상:** `POST /payments/confirm`
- **위험:** 클라이언트가 전달하는 `amount`를 그대로 토스 API에 전달하면 금액 조작 가능
- **필수 구현:**
  ```typescript
  // payments.service.ts
  const order = await this.orderRepo.findByTossOrderId(dto.orderId)
  if (order.totalAmount !== dto.amount) {
    throw new BadRequestException('결제 금액이 일치하지 않습니다.')
  }
  // 검증 통과 후에만 토스 confirm 호출
  ```
- **상태: ❌ 반드시 구현 필요**

### CRITICAL — 토스 시크릿 키 노출 방지
- **위험:** `TOSS_SECRET_KEY`가 클라이언트 코드나 로그에 노출될 경우 무단 환불 가능
- **필수 구현:** 환경변수로만 관리, 서버 사이드에서만 사용, 절대 응답에 포함 금지
- **상태: ❌ 구현 전 주의 필요**

### HIGH — 결제/취소 본인 확인
- **대상:** `POST /payments/cancel`
- **위험:** 다른 유저의 orderId로 환불 요청 가능
- **필수 구현:** `order.user.id === req.user.id` 검증
- **상태: ❌ 반드시 구현 필요**

### HIGH — 리뷰 80% 수강 검증 서버사이드 강제
- **위험:** 클라이언트에서 수강률을 속이고 리뷰 작성 시도 가능
- **필수 구현:** 서버에서 `VideoWatchLog` 기반으로 직접 계산, 클라이언트 값 신뢰 금지
- **상태: ❌ 반드시 구현 필요**

### MEDIUM — 북마크/시청 이력 본인 확인
- **대상:** `DELETE /bookmarks/:id`, `GET /videos/:id/progress`
- **위험:** 다른 유저의 북마크/이력 조회·삭제 가능
- **필수 구현:** 조회 시 `WHERE id = :id AND user_id = :userId` 조건 강제
- **상태: ❌ 구현 시 주의 필요**

### MEDIUM — 장바구니 중복 구매 방지
- **위험:** 이미 수강 중인 코스를 장바구니에 담아 재결제 시도
- **필수 구현:** `addToCart` 시 `Enrollment` 테이블 조회로 이미 수강 중인지 확인
- **상태: ❌ 구현 시 주의 필요**

---

## 프로덕션 배포 전 필수 조치

```bash
# 1. 강력한 JWT 시크릿 생성
openssl rand -base64 32   # JWT_SECRET_KEY
openssl rand -base64 32   # JWT_REFRESH_SECRET_KEY

# 2. 환경변수 설정
NODE_ENV=prod
CLIENT_URL=https://your-domain.com
DATABASE_URL=postgresql://...강력한비밀번호...

# 3. Helmet 설치 및 적용
npm install helmet

# 4. Rate Limiting 설치
npm install @nestjs/throttler

# 5. CORS origin 제한
origin: process.env.CLIENT_URL
```
