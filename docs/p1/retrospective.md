# P1 회고 — 기초 CRUD 구현

## 개요

P1은 Solving Meal 플랫폼의 핵심 도메인(강좌, 수강, 리뷰, 북마크)을 NestJS + TypeORM 기반으로 구현한 단계입니다. REST API 설계와 데이터베이스 모델링에 집중했습니다.

---

## 잘한 점

### NestJS 모듈 구조 설계
- 도메인별(courses, enrollments, reviews, bookmarks, users) 모듈을 명확하게 분리하여 관심사를 격리했습니다.
- 각 모듈이 독립적으로 테스트 및 교체 가능한 구조를 갖추었습니다.
- `AppModule`에서 전역 설정(ConfigModule, TypeOrmModule)을 한곳에서 관리해 중복을 제거했습니다.

### TypeORM 레포지토리 패턴 적용
- Service 계층이 직접 SQL을 작성하지 않고 Repository를 통해 데이터에 접근하도록 구성했습니다.
- Entity 간 관계(OneToMany, ManyToOne, ManyToMany)를 TypeORM 데코레이터로 선언적으로 정의했습니다.
- `requiredTools` 필드에 PostgreSQL JSONB 타입을 활용해 유연한 데이터 구조를 표현했습니다.

### Swagger 자동화
- `@nestjs/swagger` 데코레이터(`@ApiTags`, `@ApiOperation`, `@ApiResponse`)를 모든 컨트롤러에 적용했습니다.
- DTO에 `@ApiProperty`를 통해 요청/응답 스키마가 자동으로 문서화되도록 했습니다.
- `/api/v1/docs` 경로에서 팀원 및 프론트엔드 개발자가 API를 바로 확인할 수 있었습니다.

---

## 개선점

### 테스트 코드 부재
- 유닛 테스트(`*.spec.ts`)를 작성하지 않아 리팩토링 시 회귀 여부를 수동으로 확인해야 했습니다.
- Service 로직의 엣지 케이스(빈 목록, 중복 수강 등)가 런타임에만 검증되었습니다.

### 페이지네이션 미구현
- `GET /courses` 엔드포인트가 전체 목록을 한 번에 반환해 데이터가 증가할수록 응답이 느려질 위험이 있었습니다.
- `page`, `limit` 쿼리 파라미터 기반의 커서 또는 오프셋 페이지네이션이 필요했습니다.

### 에러 메시지 일관성 부족
- 일부 엔드포인트는 NestJS 기본 예외(`NotFoundException`)를, 일부는 직접 작성한 메시지를 반환해 클라이언트 처리가 복잡해졌습니다.
- 전역 `ExceptionFilter`를 통한 표준 에러 응답 포맷 적용이 필요했습니다.

---

## 기술 부채

| 항목 | 내용 | 우선순위 |
|------|------|---------|
| 인메모리 mock 대신 실 DB 테스트 | Jest + `@nestjs/testing` + 테스트 전용 PostgreSQL 컨테이너 필요 | 높음 |
| CI 파이프라인 미설정 | GitHub Actions로 PR마다 빌드/테스트 자동화 필요 | 중간 |
| 전역 에러 필터 미적용 | `HttpExceptionFilter`를 `main.ts`에서 전역 등록 필요 | 중간 |
| 페이지네이션 부재 | `typeorm-pagination` 또는 커스텀 PaginationDto 도입 필요 | 높음 |
| 환경변수 검증 부재 | `@nestjs/config` + `Joi` 스키마로 앱 시작 시 검증 필요 | 낮음 |

---

## 다음 단계 (P2 목표)

- **JWT 인증 도입**: Access Token + Refresh Token Rotation(RTR) 전략 적용
- **RBAC 구현**: `ADMIN`, `INSTRUCTOR`, `STUDENT` 역할 기반 접근 제어 (`RolesGuard`)
- **Guard/Decorator 패턴**: `@Roles()` 커스텀 데코레이터로 선언적 권한 제어
- **비밀번호 보안**: `bcrypt`를 이용한 해싱 처리
- **토큰 블랙리스트**: Redis를 활용한 로그아웃 토큰 무효화

---

*작성일: 2026-06-02*
