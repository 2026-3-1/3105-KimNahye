# ADR-001: JWT 기반 인증 방식 채택

## 상태: 승인됨

**결정일**: 2026-02-10
**결정자**: 백엔드 개발팀

---

## 컨텍스트

Solving Meal 플랫폼은 학생, 강사, 관리자 세 가지 역할을 가진 사용자를 구분해야 합니다. 사용자 인증 방식을 선택해야 하며, 다음 요구사항을 만족해야 합니다.

- REST API 기반 서버 (NestJS)와 SPA 클라이언트(React) 구조
- 역할 기반 접근 제어(RBAC) 구현 필요
- 수평 확장(Scale-Out) 가능성 고려
- 모바일 클라이언트 지원 가능성 (향후)
- 별도 OAuth 제공자 계정 없이 자체 계정 관리

---

## 결정

**Access Token + Refresh Token Rotation(RTR) 전략의 JWT 인증**을 채택합니다.

- Access Token: 만료 시간 15분, 사용자 정보 및 역할(role) 포함
- Refresh Token: 만료 시간 7일, Redis에 저장하여 무효화 관리
- Refresh Token Rotation: Refresh Token 사용 시 새 Refresh Token 발급 및 기존 토큰 폐기
- 로그아웃 시 Redis에서 Refresh Token 즉시 삭제

### 핵심 구현 사항

```typescript
// JWT Payload 구조
interface JwtPayload {
  sub: number;        // userId
  email: string;
  role: UserRole;     // STUDENT | INSTRUCTOR | ADMIN
  iat: number;
  exp: number;
}

// RTR 전략
// 1. 로그인: Access Token(15분) + Refresh Token(7일) 발급
// 2. Access Token 만료: Refresh Token으로 갱신 요청
// 3. Refresh Token 갱신 시: 기존 토큰 Redis에서 삭제 + 신규 쌍 발급
// 4. 로그아웃: Redis에서 Refresh Token 즉시 삭제
```

---

## 이유

1. **Stateless 구조**: JWT는 서버가 상태를 저장하지 않아 수평 확장 시 세션 공유 문제가 없습니다.
2. **RBAC 구현 용이**: Payload에 역할 정보를 포함해 Guard에서 별도 DB 조회 없이 권한 확인이 가능합니다.
3. **NestJS 생태계 지원**: `@nestjs/jwt`, `@nestjs/passport` 패키지가 잘 지원되며, `JwtStrategy`, `JwtAuthGuard` 패턴이 표준화되어 있습니다.
4. **SPA 친화적**: `localStorage` 또는 HTTP-only 쿠키에 토큰을 저장하는 방식으로 React와 자연스럽게 통합됩니다.
5. **RTR로 보안 강화**: Refresh Token을 1회용으로 처리해 토큰 탈취 시 재사용을 방지합니다.

---

## 결과

### 장점
- 서버 세션 저장소 불필요 → DB/메모리 부담 감소
- 마이크로서비스로 전환 시에도 동일한 인증 구조 유지 가능
- 토큰 자체에 필요한 정보를 담아 매 요청마다 DB 조회 불필요
- Access Token 만료 시간을 짧게 설정(15분)해 보안 위험 최소화

### 단점
- Access Token 즉시 무효화 불가 (만료 전 발급된 토큰은 계속 유효)
  → 완화책: Access Token 만료 시간을 15분으로 짧게 설정
- 클라이언트가 토큰 갱신 로직을 직접 구현해야 함 (axios interceptor)
- Refresh Token 관리를 위한 Redis 인프라 필요

---

## 대안 검토

### 세션 기반 인증
- **장점**: 서버에서 즉시 세션 무효화 가능, 구현 단순
- **단점**: 다중 서버 환경에서 세션 공유 필요 (Sticky Session 또는 Redis 세션 스토어), SPA와의 통합 복잡
- **기각 이유**: 수평 확장 시 세션 공유 아키텍처 추가 필요, NestJS + React SPA 구조와 어울리지 않음

### OAuth 2.0 + 소셜 로그인 (Google, Kakao 등)
- **장점**: 비밀번호 관리 불필요, 사용자 편의성 높음
- **단점**: 외부 OAuth 제공자 의존성 발생, 자체 회원 관리 복잡
- **기각 이유**: 자체 계정 시스템이 기본이며, 소셜 로그인은 향후 추가 기능으로 고려

### API Key 방식
- **장점**: 구현 단순, B2B 서비스에 적합
- **단점**: 사용자별 권한 관리 어려움, 만료/갱신 메커니즘 부재
- **기각 이유**: 사용자 인증보다 서비스 간 통신에 적합한 방식으로 본 요구사항과 불일치

---

*작성일: 2026-02-10 | 최종 검토: 2026-06-02*
