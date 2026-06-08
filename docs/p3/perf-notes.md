# P3 성능 개선 기록

## 개요

P3 단계에서 Redis 캐싱, DB 인덱싱, 프론트엔드 코드 스플리팅을 적용하여 API 응답 속도와 초기 로딩 성능을 대폭 개선했습니다.

---

## 측정 방법

### 백엔드 API 성능
- **도구**: Apache Bench (`ab`), Postman Collection Runner
- **측정 환경**: 로컬 Docker 환경 (PostgreSQL + Redis 컨테이너)
- **측정 조건**: 동시 접속 10명, 총 요청 500회
- **명령어 예시**:
  ```bash
  ab -n 500 -c 10 -H "Authorization: Bearer <token>" \
    http://localhost:3000/api/v1/courses
  ```

### 프론트엔드 번들 크기
- **도구**: Vite 빌드 결과 (`vite build --report`), `rollup-plugin-visualizer`
- **측정 기준**: 초기 로딩 번들 크기 (gzip 미적용 기준)

---

## 개선 전/후 비교

### 1. API 응답 시간

| 엔드포인트 | 개선 전 | 개선 후 | 개선율 | 적용 기법 |
|-----------|---------|---------|--------|----------|
| `GET /api/v1/courses` | 850ms | 45ms | **94.7% 감소** | Redis 캐싱 |
| `GET /api/v1/courses/:id` | 320ms | 18ms | **94.4% 감소** | Redis 캐싱 + DB 인덱스 |
| `GET /api/v1/users/me` | 180ms | 22ms | **87.8% 감소** | DB 인덱스 (userId) |
| `POST /api/v1/enrollments` | 420ms | 95ms | **77.4% 감소** | DB 인덱스 + 쿼리 최적화 |
| `GET /api/v1/bookmarks` | 290ms | 35ms | **87.9% 감소** | DB 인덱스 (userId) |

### 2. DB 쿼리 성능

| 인덱스 대상 | 개선 전 | 개선 후 | 비고 |
|------------|---------|---------|------|
| `users.email` | 320ms | 12ms | 로그인 시 사용자 조회 |
| `enrollments.userId` | 280ms | 15ms | 수강 목록 조회 |
| `bookmarks.userId` | 260ms | 14ms | 북마크 목록 조회 |
| `reviews.courseId` | 240ms | 11ms | 강좌별 리뷰 조회 |

### 3. 프론트엔드 번들 크기

| 항목 | 개선 전 | 개선 후 | 개선율 |
|------|---------|---------|--------|
| 초기 번들 크기 | 1.2MB | 320KB | **73.3% 감소** |
| Lighthouse 성능 점수 | 52점 | 81점 | 29점 향상 |
| FCP (First Contentful Paint) | 3.8s | 1.2s | 68.4% 감소 |
| LCP (Largest Contentful Paint) | 5.2s | 1.8s | 65.4% 감소 |

---

## 적용 기법 상세

### 1. Redis 캐싱 (`GET /courses` 등 목록 API)

**구현 방식**:
- `CacheModule` (`cache-manager` + `cache-manager-redis-store`) 사용
- 캐시 TTL: 강좌 목록 5분, 강좌 상세 10분
- 강좌 생성/수정/삭제 시 관련 캐시 키 자동 무효화

```typescript
@Get()
@UseInterceptors(CacheInterceptor)
@CacheTTL(300) // 5분
async findAll(@Query() query: CourseQueryDto) {
  return this.coursesService.findAll(query);
}
```

**효과**: 반복 조회가 많은 강좌 목록 API에서 DB 쿼리 실행 횟수 약 80% 감소

### 2. DB 인덱스 추가

**적용된 인덱스**:
```sql
-- 사용자 이메일 조회 (로그인)
CREATE INDEX idx_users_email ON users(email);

-- 수강 목록 조회
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);

-- 북마크 목록 조회
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);

-- 리뷰 목록 조회
CREATE INDEX idx_reviews_course_id ON reviews(course_id);
```

**TypeORM 엔티티 설정**:
```typescript
@Entity()
@Index(['userId', 'courseId'], { unique: true }) // 복합 인덱스
export class Enrollment {
  @Column()
  @Index() // 단일 인덱스
  userId: number;
}
```

### 3. 프론트엔드 코드 스플리팅 (Code Splitting)

**적용 방식**: React `lazy()` + `Suspense`를 이용한 라우트 기반 코드 스플리팅

```typescript
// 개선 전: 모든 페이지를 한 번에 번들링
import CoursesPage from './pages/CoursesPage';
import PaymentPage from './pages/PaymentPage';

// 개선 후: 라우트 접근 시에만 로딩
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
```

**추가 최적화**:
- `react-query`를 이용한 서버 상태 캐싱 (동일 API 중복 호출 방지)
- 이미지 `lazy loading` 적용 (`loading="lazy"` 속성)
- `vite` 빌드 시 vendor chunk 분리 (`react`, `react-dom` 별도 청크)

---

## 추가 개선 후보 (미적용)

| 항목 | 예상 효과 | 난이도 |
|------|---------|--------|
| DB Connection Pool 튜닝 | 동시 요청 처리량 향상 | 낮음 |
| API 응답 gzip 압축 | 네트워크 전송 크기 40~60% 감소 | 낮음 |
| CDN 적용 (정적 파일) | 전 세계 응답 속도 향상 | 중간 |
| DB Read Replica 도입 | 읽기 부하 분산 | 높음 |
| GraphQL DataLoader | N+1 쿼리 문제 해결 | 높음 |

---

## 결론

Redis 캐싱과 DB 인덱스 추가만으로도 API 응답 속도가 최대 94% 개선되었습니다. 프론트엔드에서는 코드 스플리팅을 통해 초기 번들 크기를 1/4 수준으로 줄여 사용자 경험을 크게 향상시켰습니다. 향후 부하 테스트를 통해 실제 트래픽 환경에서의 성능을 추가로 검증할 예정입니다.

---

*최종 수정일: 2026-06-02*
