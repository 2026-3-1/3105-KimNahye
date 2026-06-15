# ADR 001 — PostgreSQL + TypeORM 선택

**날짜**: 2026-03-01  
**상태**: 수락됨

---

## 컨텍스트

인강 서비스의 데이터 저장소를 선택해야 함. 주요 고려 사항:
- 코스, 영상, 수강 이력, 리뷰 등 관계형 데이터 중심
- `requiredTools`처럼 유연한 배열 데이터도 필요
- NestJS와의 통합 용이성

## 결정

**PostgreSQL**을 DBMS로, **TypeORM**을 ORM으로 선택

## 이유

| 항목 | PostgreSQL | MySQL |
|---|---|---|
| JSONB 지원 | ✅ 네이티브 | ❌ JSON 타입(검색 느림) |
| NestJS 공식 지원 | ✅ | ✅ |
| UUID PK | ✅ | ✅ (추가 설정) |

TypeORM을 선택한 이유:
- NestJS `@nestjs/typeorm` 공식 통합
- 엔티티 클래스 데코레이터 방식으로 코드 가독성 높음
- Repository 패턴 지원 → 서비스 레이어 테스트 용이

## 결과

- `requiredTools`를 JSONB 컬럼으로 저장 → 필터 쿼리 구현
- 엔티티 기반 자동 스키마 동기화 (`synchronize: true`, dev 전용)
- 운영 환경에서는 마이그레이션 스크립트로 전환 필요

## 트레이드오프

- TypeORM의 복잡한 쿼리는 QueryBuilder로 처리해야 함
- `synchronize: true`는 개발 편의용 — 운영에서는 위험하므로 반드시 비활성화
