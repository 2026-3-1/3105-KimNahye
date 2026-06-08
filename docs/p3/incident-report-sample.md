# 장애 보고서 — 결제 API 일시 중단

**보고서 번호**: INC-2026-001
**작성자**: 백엔드 개발팀
**작성일**: 2026-05-15
**심각도**: P2 (High) — 핵심 기능 영향, 데이터 손실 없음

---

## 개요

| 항목 | 내용 |
|------|------|
| 발생 일시 | 2026-05-15 14:23 KST |
| 복구 일시 | 2026-05-15 14:28 KST |
| 총 영향 시간 | 약 5분 |
| 영향 범위 | 결제 API (`POST /api/v1/payments/confirm`) 전체 |
| 증상 | 결제 요청 시 `503 Service Unavailable` 응답 |
| 영향 사용자 수 | 추정 12명 (결제 시도 실패) |
| 데이터 손실 | 없음 (결제 미완료 처리, 실제 과금 없음) |

---

## 타임라인

| 시각 (KST) | 이벤트 |
|------------|--------|
| 14:23:05 | Toss Payments API 서버 일시 장애 시작 (외부 원인) |
| 14:23:07 | 첫 번째 결제 요청 실패 — 503 응답 반환 시작 |
| 14:23:30 | Slack `#solving-meal-alert` 채널에 에러 알림 수신 |
| 14:24:00 | 담당 개발자 Slack 알림 확인 및 조사 시작 |
| 14:24:30 | 로그 확인 — `TossPayments API 503` 에러 반복 확인 |
| 14:25:00 | Toss Payments 상태 페이지 확인 — "결제 서버 일시 점검 중" 공지 확인 |
| 14:25:30 | 서비스 자체 코드 문제가 아님을 확인, 외부 장애로 판단 |
| 14:27:00 | Toss Payments API 복구 시작 (외부 공지) |
| 14:28:10 | 결제 API 정상 응답 재개 확인 |
| 14:30:00 | 영향받은 사용자 식별 및 내부 공유 완료 |
| 14:35:00 | 장애 보고서 초안 작성 시작 |

---

## 근본 원인

### 1차 원인 (직접 원인)
- **Toss Payments API 서버 일시 장애**: 2026-05-15 14:23 ~ 14:28 KST 동안 Toss Payments 결제 확인 API(`/v1/payments/confirm`)가 503 응답을 반환

### 2차 원인 (우리 서비스 취약점)
- **Retry 로직 미구현**: 외부 API 호출 실패 시 즉시 에러를 반환하도록 구현되어 있어, Toss API 일시 장애가 그대로 사용자에게 노출됨
- **타임아웃 설정 부재**: HTTP 클라이언트(`axios`)에 타임아웃 설정이 없어, Toss API 응답 지연 시 무한 대기 가능성 존재
- **Circuit Breaker 패턴 미적용**: 연속 실패 시에도 계속 Toss API를 호출해 불필요한 부하 발생

```typescript
// 장애 당시 코드 (문제 있음)
async confirmPayment(paymentKey: string, orderId: string, amount: number) {
  // Retry 없이 단순 호출 — 실패 시 즉시 예외 발생
  const response = await this.httpService.post(
    `${this.tossApiUrl}/payments/confirm`,
    { paymentKey, orderId, amount },
    { headers: { Authorization: `Basic ${this.secretKey}` } }
  ).toPromise();
  return response.data;
}
```

---

## 대응 조치

### 즉시 조치 (장애 중)
- Toss Payments 상태 페이지 모니터링으로 외부 원인 신속 확인
- 내부 서비스 코드 이상 없음 확인 → 불필요한 배포/롤백 방지
- 장애 복구 후 결제 실패 로그 분석 및 영향 사용자 식별

### 사후 조치 (장애 후)
- 영향받은 12명 사용자에게 재결제 안내 이메일 발송
- 결제 상태가 `PENDING`으로 남은 건 수동으로 `FAILED` 처리

---

## 재발 방지

### 1. Retry + Exponential Backoff 구현 (우선순위: 높음)

```typescript
// 개선 후 코드
import { retry } from 'rxjs/operators';

async confirmPayment(paymentKey: string, orderId: string, amount: number) {
  return this.httpService.post(
    `${this.tossApiUrl}/payments/confirm`,
    { paymentKey, orderId, amount },
    {
      headers: { Authorization: `Basic ${this.secretKey}` },
      timeout: 5000, // 5초 타임아웃 추가
    }
  ).pipe(
    retry({
      count: 3,
      delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000), // 1s, 2s, 4s
    })
  ).toPromise();
}
```

### 2. 외부 API 타임아웃 설정 (우선순위: 높음)
- 모든 외부 API 호출에 `timeout: 5000ms` 설정
- `HttpModule` 전역 설정에 기본 타임아웃 적용

### 3. Circuit Breaker 패턴 도입 (우선순위: 중간)
- `nestjs-circuit-breaker` 또는 `opossum` 라이브러리 도입 검토
- 연속 5회 실패 시 Circuit Open → 30초 후 Half-Open 상태로 전환

### 4. 외부 API 헬스체크 모니터링 추가 (우선순위: 중간)
- `/api/v1/health` 엔드포인트에 Toss Payments API 연결 상태 포함
- 장애 감지 시 Slack 알림 즉시 발송

### 5. 결제 실패 사용자 자동 알림 (우선순위: 낮음)
- 결제 실패 시 사용자에게 자동으로 재결제 안내 이메일 발송

### 조치 일정

| 조치 항목 | 담당 | 완료 목표일 |
|-----------|------|------------|
| Retry + Backoff 구현 | 백엔드 | 2026-05-17 |
| 타임아웃 설정 | 백엔드 | 2026-05-17 |
| Circuit Breaker 도입 | 백엔드 | 2026-05-22 |
| 헬스체크 업데이트 | 백엔드 | 2026-05-20 |
| 자동 알림 이메일 | 백엔드 | 2026-05-25 |

---

## 교훈

1. **외부 의존성에는 항상 Retry와 타임아웃을 설정해야 한다.** 제3자 서비스의 일시 장애가 우리 서비스의 장애로 전파되지 않도록 격리가 필요하다.
2. **장애 감지는 빨랐지만 대응 가이드가 없었다.** Runbook의 필요성을 확인했으며, 이후 `docs/p3/runbook.md`를 작성했다.
3. **외부 서비스 상태 페이지를 즉시 확인하는 습관이 장애 원인 파악 시간을 단축했다.**

---

*작성일: 2026-05-15 | 최종 검토: 2026-06-02*
