# ADR-002: PostgreSQL 데이터베이스 선택

## 상태: 승인됨

**결정일**: 2026-02-10
**결정자**: 백엔드 개발팀

---

## 컨텍스트

Solving Meal 플랫폼의 주 데이터베이스를 선택해야 합니다. 저장해야 하는 데이터의 특성은 다음과 같습니다.

- 사용자, 강좌, 수강 이력, 리뷰, 북마크 등 관계형 데이터가 핵심
- 강좌의 `requiredTools` 필드: 조리도구 목록을 유연한 구조로 저장 필요 (ex: `["칼", "냄비", "프라이팬"]`)
- 결제 처리에서 ACID 트랜잭션 필수
- NestJS + TypeORM 기반 백엔드
- Docker Compose 기반 로컬 개발 환경

---

## 결정

**PostgreSQL 15**를 주 데이터베이스로 채택합니다.

- `requiredTools` 컬럼에 PostgreSQL JSONB 타입 사용
- TypeORM을 통한 엔티티 관리 및 마이그레이션
- Docker 이미지: `postgres:15-alpine`

---

## 이유

### 1. JSONB 타입 지원

강좌의 `requiredTools` 필드는 강좌마다 다른 구조를 가질 수 있습니다. PostgreSQL의 JSONB 타입을 사용하면 별도의 조인 테이블 없이 유연하게 저장하고 인덱싱할 수 있습니다.

```typescript
// TypeORM 엔티티에서 JSONB 사용
@Entity()
export class Course {
  @Column({ type: 'jsonb', nullable: true })
  requiredTools: string[];  // ex: ["칼", "도마", "냄비"]
}
```

관계형 테이블로 설계할 경우 `course_tools` 테이블이 추가로 필요하고 매번 조인이 발생합니다. JSONB는 이 오버헤드를 제거합니다.

### 2. TypeORM 완전 호환성

NestJS의 공식 ORM인 TypeORM이 PostgreSQL과 가장 안정적으로 동작합니다. 마이그레이션, 관계 매핑, 쿼리 빌더 모두 완전히 지원됩니다.

### 3. 트랜잭션 지원 (결제 처리)

결제 확인 시 주문 상태 변경과 수강 등록을 하나의 트랜잭션으로 처리해야 합니다. PostgreSQL의 ACID 트랜잭션이 데이터 정합성을 보장합니다.

```typescript
await this.dataSource.transaction(async (manager) => {
  await manager.update(Order, { id: orderId }, { status: 'PAID' });
  await manager.save(Enrollment, { userId, courseId });
});
```

### 4. 풍부한 생태계 및 운영 안정성

- 오랜 역사와 검증된 안정성
- `pg_stat_statements`를 통한 슬로우 쿼리 분석
- `EXPLAIN ANALYZE`로 쿼리 실행 계획 최적화
- Docker 이미지가 경량(`postgres:15-alpine`)이며 로컬 개발 환경 구성 용이

---

## 결과

### 장점
- JSONB로 스키마 유연성과 관계형 DB의 장점을 동시에 확보
- TypeORM 마이그레이션으로 스키마 변경 이력 관리 가능
- ACID 트랜잭션으로 결제/수강 등록 데이터 정합성 보장
- GIN 인덱스를 JSONB 필드에 적용해 검색 성능 확보 가능

### 단점
- MySQL 대비 호스팅 서비스 선택지가 약간 적음 (AWS RDS, Supabase 등 주요 서비스는 모두 지원)
- 초기 설정이 MySQL보다 다소 복잡
- 대용량 트래픽에서 PostgreSQL 자체 튜닝 필요 (connection pool, `max_connections` 등)

---

## 대안 검토

### MySQL / MariaDB
- **장점**: 높은 보급률, 가벼운 설정, 웹 서비스 전통적 선택
- **단점**: JSONB 미지원 (JSON 타입은 있으나 인덱싱/쿼리 성능이 열등), TypeORM에서 일부 기능 제한
- **기각 이유**: `requiredTools` 필드를 JSONB로 처리하기 위해 PostgreSQL이 더 적합

### MongoDB
- **장점**: 스키마 유연성 극대화, 문서 지향 모델
- **단점**: 트랜잭션 지원이 관계형 DB보다 제한적, TypeORM 대신 Mongoose/Prisma 필요, 관계형 데이터(수강, 리뷰 등) 표현이 복잡
- **기각 이유**: 핵심 데이터가 관계형이며, 결제 처리에서 강력한 트랜잭션이 필수

### SQLite
- **장점**: 설정 불필요, 개발 환경에서 편리
- **단점**: 운영 환경 부적합, 동시 쓰기 성능 한계, JSONB 미지원
- **기각 이유**: 운영 환경 적합성 없음

---

*작성일: 2026-02-10 | 최종 검토: 2026-06-02*
