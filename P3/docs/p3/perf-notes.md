# P3 성능 최적화 기록 — Solving Meal

## 적용된 최적화

### 1. Redis 응답 캐시

| 항목 | 내용 |
|---|---|
| 대상 | `GET /api/v1/courses/list` |
| 구현 | `@nestjs/cache-manager` + `@keyv/redis` |
| TTL | 300초 (5분) |
| 전략 | 캐시 HIT 시 DB 쿼리 생략 |

**기대 효과**: 동시 접속자 증가 시 DB 부하 감소

---

### 2. DB 인덱스 추가

| 테이블 | 인덱스 | 목적 |
|---|---|---|
| `courses` | `(category, difficulty)` | 코스 목록 필터 쿼리 최적화 |
| `enrollments` | `(user_id, course_id)` | 수강 여부 중복 체크 최적화 |
| `video_watch_logs` | `(user_id, video_id)` | UNIQUE 제약 + 조회 최적화 |

**적용 방법**: TypeORM `@Index` 데코레이터

---

### 3. 프론트엔드 코드 스플리팅

| 항목 | 내용 |
|---|---|
| 구현 | `React.lazy()` + `<Suspense>` |
| 적용 범위 | 모든 페이지 컴포넌트 (App.tsx) |
| 로딩 UI | "로딩 중..." 전체화면 표시 |

**기대 효과**: 초기 번들 크기 감소, 첫 페이지 로딩 속도 향상

---

## 성능 측정 (예정)

### 백엔드

```bash
# 코스 목록 응답 시간 측정 (캐시 없음)
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:8080/api/v1/courses/list"

# 캐시 적용 후 재측정
# 첫 요청: DB 조회
# 두 번째 요청: Redis 캐시 HIT → 응답 시간 비교
```

### 프론트엔드

```bash
# Vite 번들 분석
cd P3/client
npm run build -- --report
```

---

## 향후 개선 계획

| 항목 | 우선순위 | 설명 |
|---|---|---|
| `GET /courses/:id` Redis 캐시 | 중간 | TTL 120s로 상세 페이지 캐시 |
| 슬로우 쿼리 분석 | 중간 | PostgreSQL `pg_stat_statements` 활성화 |
| 이미지 최적화 | 낮음 | hero.png 등 WebP 변환 |
| Lighthouse 측정 | 낮음 | 프론트엔드 성능 점수 기록 |
