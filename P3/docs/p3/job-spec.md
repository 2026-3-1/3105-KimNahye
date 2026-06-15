# P3 배치/스케줄러 명세 — Solving Meal

## 등록된 Cron Job

### 1. 만료 RefreshToken 정리

| 항목 | 내용 |
|---|---|
| 스케줄 | 매일 자정 (`0 0 * * *`) |
| 담당 클래스 | `SchedulerService.cleanExpiredRefreshTokens()` |
| 동작 | `expires_at < NOW()` 또는 `is_revoked = true`인 레코드 삭제 |
| 로그 | `만료된 RefreshToken N건 삭제 완료` |
| 실패 처리 | NestJS Logger로 에러 로깅, 다음 실행 시 재시도 |

### 2. 일별 통계 로그

| 항목 | 내용 |
|---|---|
| 스케줄 | 매일 오전 6시 (`0 6 * * *`) |
| 담당 클래스 | `SchedulerService.dailyStatsLog()` |
| 동작 | 현재 날짜 기준 실행 완료 로그 기록 |
| 목적 | 스케줄러 정상 동작 여부 모니터링 |

---

## 외부 API 연동

### 토스페이먼츠 결제 확인

| 항목 | 내용 |
|---|---|
| 엔드포인트 | `POST https://api.tosspayments.com/v1/payments/confirm` |
| 인증 | `Basic base64(TOSS_SECRET_KEY:)` |
| 재시도 | `withRetry()` — 최대 3회, Exponential Backoff |
| 멱등성 | `paymentKey` DB 중복 체크 |
| 실패 처리 | Toss 응답 메시지를 `BadRequestException`으로 전달 |

### 이메일 발송 (nodemailer)

| 항목 | 내용 |
|---|---|
| 트리거 | 결제/수강 완료 시 |
| 담당 클래스 | `MailService.sendEnrollmentConfirmation()` |
| 실패 처리 | `.catch(() => {})` — 발송 실패가 결제 결과에 영향 없음 |
| 재시도 | 별도 재시도 없음 (알림 특성상 1회 시도) |

### 토스페이먼츠 Webhook 수신

| 항목 | 내용 |
|---|---|
| 엔드포인트 | `POST /api/v1/payments/webhook` |
| 시그니처 검증 | HMAC-SHA256 (`TOSS_WEBHOOK_SECRET`) |
| 멱등성 | `paymentKey`로 중복 이벤트 무시 |
| 지원 이벤트 | `PAYMENT_STATUS_CHANGED` (CANCELED) |

---

## 재시도 정책 (`retry.util.ts`)

```typescript
withRetry(fn, { maxAttempts: 3, delayMs: 500, backoff: 'exponential' })
```

- 최대 3회 재시도
- 초기 딜레이 500ms, 지수 증가 (500 → 1000 → 2000ms)
- 네트워크 오류 / 5xx 응답에만 재시도
- 4xx 응답은 즉시 실패 반환

---

## 작업 로그 형식

모든 배치 작업은 Winston 구조화 로그로 기록됨:

```json
{
  "timestamp": "2026-06-15T00:00:00.000Z",
  "level": "INFO",
  "context": "SchedulerService",
  "message": "만료된 RefreshToken 12건 삭제 완료"
}
```

로그 파일 위치:
- `logs/app-YYYY-MM-DD.log` — 전체 로그 (14일 보관)
- `logs/error-YYYY-MM-DD.log` — 에러 로그 (30일 보관)
