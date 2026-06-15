# ADR 002 — JWT + Refresh Token Rotation (RTR) 인증 전략

**날짜**: 2026-03-15  
**상태**: 수락됨

---

## 컨텍스트

사용자 인증 방식을 선택해야 함. 요구사항:
- STUDENT / TEACHER 역할 기반 접근 제어
- 세션 방식 vs 토큰 방식 선택 필요
- 모바일/브라우저 모두 지원 고려

## 결정

**JWT 이중 토큰 + Refresh Token Rotation (RTR)** 방식 채택

- Access Token: 1시간 만료 (메모리 저장)
- Refresh Token: 7일 만료 (DB 저장, httpOnly 쿠키)
- RTR: Refresh Token 1회 사용 후 즉시 폐기 + 새 토큰 발급

## 이유

| 방식 | 장점 | 단점 |
|---|---|---|
| 세션 | 즉시 무효화 가능 | 서버 상태 관리, Redis 필수 |
| JWT 단독 | Stateless, 확장성 | 토큰 탈취 시 즉시 무효화 불가 |
| **JWT + RTR** | Stateless + 토큰 탈취 감지 가능 | DB 저장 필요 |

RTR을 선택한 이유:
- Refresh Token 재사용 감지 가능 (탈취된 토큰으로 갱신 시도 시 탐지)
- Access Token 수명이 짧아 탈취 피해 최소화
- NestJS Passport 전략으로 깔끔하게 구현 가능

## 결과

- `JwtAccessStrategy` / `JwtRefreshStrategy` 두 Passport 전략 구현
- `RefreshToken` 엔티티에 `isRevoked`, `expiresAt` 관리
- 스케줄러로 만료/폐기 토큰 자동 정리

## 트레이드오프

- Refresh Token DB 조회가 추가되어 갱신 요청마다 DB 접근 발생
- 여러 기기 동시 로그인 시 한 기기에서 갱신하면 다른 기기 토큰 폐기됨
  → 현재는 기기별 세션 분리 미지원 (추후 개선 가능)
