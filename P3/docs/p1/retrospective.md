# P1 회고 — Solving Meal

## 기간
2026년 3학년 1학기 1~4주차

---

## 잘한 점

### 기술적
- **NestJS 모듈 구조** 처음부터 도메인 단위(auth, courses, videos, user)로 분리해서 P2/P3 확장이 수월했음
- **Repository 인터페이스 패턴** 도입으로 서비스 레이어가 구현체에 의존하지 않게 설계
- **TypeORM + PostgreSQL** 조합으로 JSONB 컬럼(requiredTools) 활용, 유연한 스키마 설계
- **Swagger 자동화** — DTO + 데코레이터로 API 문서가 코드와 항상 동기화됨
- **Docker Compose** dev/prod 환경 분리로 팀원 온보딩 비용 최소화

### 프로세스
- Conventional Commits 규칙 처음부터 적용해서 커밋 히스토리가 읽기 쉬움
- GitHub Actions CI로 빌드/린트 자동화

---

## 아쉬운 점 / 개선이 필요한 부분

| 항목 | 문제 | 개선 방향 |
|---|---|---|
| 테스트 코드 | 유닛 테스트가 사실상 없었음 | P2부터 서비스 레이어 테스트 추가 |
| DB 마이그레이션 | TypeORM `synchronize: true` 사용 → 운영 DB 위험 | 마이그레이션 스크립트로 전환 |
| 보안 헤더 | Helmet 미적용 | P2에서 즉시 추가 |
| 문서 산출물 | 코드에 비해 문서가 부족 | 각 Phase 시작 전 요구사항 문서 먼저 작성 |
| 인덱스 | DB 인덱스를 고려하지 않고 개발 | P3에서 추가 예정 |

---

## 배운 점

1. **설계 먼저, 코드 나중** — ERD와 API 설계를 미리 잡으면 나중에 리팩토링 비용이 크게 줄어든다
2. **모듈 경계가 중요** — NestJS에서 순환 의존성(circular dependency)이 발생하면 `forwardRef`로 해결 가능하지만, 처음부터 의존 방향을 단방향으로 유지하는 게 낫다
3. **환경변수 관리** — `.env.example` 파일을 처음부터 만들어두면 협업 시 환경 세팅 혼란이 없다

---

## P2에서 반영할 사항

- [ ] auth 모듈 설계 시 OWASP Top 10 체크리스트 기준으로 검토
- [ ] 서비스 레이어 유닛 테스트 최소 3개 이상 작성
- [ ] Helmet 적용 및 CORS origin 환경변수화
- [ ] Sentry 에러 수집 연동 검토
