# ADR-003: Toss Payments 결제 서비스 선택

## 상태: 승인됨

**결정일**: 2026-04-01
**결정자**: 백엔드 개발팀

---

## 컨텍스트

Solving Meal 플랫폼에 유료 강좌 결제 기능을 추가해야 합니다. 사용자가 강좌를 구매할 수 있어야 하며, 결제 서비스 선택 기준은 다음과 같습니다.

- 국내 사용자 대상 서비스 (원화 결제)
- 신용카드, 카카오페이, 네이버페이 등 다양한 결제 수단 지원
- 개발 단계에서 실제 결제 없이 테스트 가능한 환경 제공
- Webhook을 통한 결제 상태 비동기 수신 지원
- NestJS 백엔드 + React 프론트엔드 통합 용이성

---

## 결정

**Toss Payments**를 결제 서비스 제공자(PG사)로 채택합니다.

- 프론트엔드: `@tosspayments/payment-widget` SDK 사용
- 백엔드: Toss Payments REST API를 axios로 직접 호출
- 테스트 환경: Toss 제공 테스트 키(`test_sk_...`, `test_ck_...`) 사용
- Webhook 수신: `POST /api/v1/payments/webhook` 엔드포인트

---

## 이유

### 1. 국내 서비스 특화

Toss Payments는 한국 결제 환경에 최적화되어 있습니다.

- 신용카드, 체크카드, 카카오페이, 네이버페이, 토스페이, 계좌이체 등 국내 주요 결제 수단 통합 지원
- 원화(KRW) 기반 결제 처리에 최적화
- 한국어 결제 UI 기본 제공으로 별도 현지화 작업 불필요

### 2. 테스트 키 무료 제공

개발 및 테스트 단계에서 실제 결제 없이 전체 결제 플로우를 검증할 수 있는 테스트 환경을 무료로 제공합니다.

```bash
# 테스트 시크릿 키 예시
TOSS_SECRET_KEY=test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R
TOSS_CLIENT_KEY=test_ck_docs_Ovk5rk1EwkEbP0W43n07xlzm
```

- 테스트 카드 번호로 성공/실패 시나리오를 자유롭게 재현 가능
- 실제 과금 없이 Webhook 수신 흐름까지 완전 테스트 가능

### 3. Webhook 지원으로 안정적인 결제 확인

결제 완료 후 Toss Payments가 서버로 결제 상태를 직접 전송하는 Webhook을 지원합니다.

```typescript
// Webhook 수신 예시
@Post('webhook')
async handleWebhook(@Body() body: TossWebhookDto) {
  if (body.eventType === 'PAYMENT_STATUS_CHANGED') {
    await this.paymentsService.handleWebhook(body);
  }
}
```

이를 통해 클라이언트 네트워크 단절 등의 상황에서도 결제 상태를 서버에서 확실히 수신할 수 있습니다.

### 4. 명확하고 풍부한 공식 문서

- 한국어 공식 문서 제공 (https://docs.tosspayments.com)
- NestJS, React 연동 예제 코드 공식 제공
- 에러 코드 및 Webhook 이벤트 타입 상세 문서화

---

## 결과

### 장점
- 단일 SDK로 10종 이상의 국내 결제 수단 지원
- 테스트 환경이 완벽히 분리되어 개발 중 실수로 실결제 발생 불가
- Webhook으로 결제 완료를 서버에서 확실히 수신 → 수강 자동 활성화 구현 가능
- 정산, 환불, 취소 API 모두 지원

### 단점
- 해외 결제(USD 등) 미지원 → 국내 서비스 전용
- Toss Payments 서버 장애 시 결제 불가 (단일 장애점)
  → 완화책: Retry + Exponential Backoff 구현 (INC-2026-001 교훈 반영)
- 월 결제 처리 금액에 따른 수수료 발생 (스타트업 초기에는 미미한 수준)

---

## 대안 검토

### iamport (포트원)
- **장점**: 다양한 PG사를 하나의 API로 통합, 높은 국내 보급률
- **단점**: 추상화 계층으로 인한 일부 기능 제한, Toss 대비 문서 품질 낮음
- **기각 이유**: Toss Payments가 직접 연동 시 더 단순하고 문서가 풍부함

### Stripe
- **장점**: 글로벌 표준, 뛰어난 개발자 경험(DX), 풍부한 SDK
- **단점**: 한국 원화 결제 시 환전 수수료 발생, 카카오페이/네이버페이 미지원, 한국 사용자에게 낯선 UI
- **기각 이유**: 국내 사용자 대상 서비스에서 국내 결제 수단 지원이 필수

### KG이니시스 / NHN KCP
- **장점**: 국내 전통 PG사, 안정적인 운영 이력
- **단점**: 개발자 친화적 API 미비, 테스트 환경 설정 복잡, 문서 품질 낮음
- **기각 이유**: 개발 생산성이 Toss 대비 크게 낮음

---

*작성일: 2026-04-01 | 최종 검토: 2026-06-02*
