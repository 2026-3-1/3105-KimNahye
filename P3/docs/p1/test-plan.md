# 테스트 계획 — Solving Meal P1

## 테스트 전략

| 레이어 | 도구 | 범위 |
|---|---|---|
| 유닛 (백엔드) | Jest + @nestjs/testing | 서비스 레이어 핵심 로직 |
| 유닛 (프론트) | Vitest + React Testing Library | UI 컴포넌트 |
| e2e | Playwright | 주요 사용자 시나리오 |

---

## 백엔드 유닛 테스트

### AuthService (`auth.service.spec.ts`)
| 테스트 케이스 | 기대 결과 |
|---|---|
| 이미 존재하는 이메일로 회원가입 | `ConflictException` 발생 |
| 정상 회원가입 | id/email/nickname/role 반환 |
| 존재하지 않는 이메일로 로그인 | `UnauthorizedException` 발생 |
| 비밀번호 불일치 로그인 | `UnauthorizedException` 발생 |
| 정상 로그인 | accessToken + refreshToken 반환 |
| 로그아웃 | 모든 refreshToken 삭제 |

### SchedulerService (`scheduler.service.spec.ts`)
| 테스트 케이스 | 기대 결과 |
|---|---|
| 만료 토큰 정리 | DELETE 쿼리 실행 완료 |
| affected가 null인 경우 | 오류 없이 완료 |
| 일별 통계 로그 | 예외 없이 실행 |

---

## 프론트 유닛 테스트

### CourseCard (`CourseCard.test.tsx`)
| 테스트 케이스 | 기대 결과 |
|---|---|
| 카테고리 이모지/이름 표시 | 화면에 렌더링됨 |
| 난이도 표시 | "난이도 하" 텍스트 노출 |
| 영상 수 표시 | "N강" 텍스트 노출 |
| 도구 최대 3개 표시 | 3개 뱃지 노출 |
| 도구 4개 이상 시 +N 뱃지 | "+N" 텍스트 노출 |
| 선생님 이름 표시 | 이름 텍스트 노출 |
| 링크 href 확인 | `/courses/:id` 형식 |

---

## e2e 테스트 (Playwright)

### 인증 시나리오 (`e2e/auth.spec.ts`)
| 시나리오 | 기대 결과 |
|---|---|
| 회원가입 → 로그인 | 홈 페이지 이동 |
| 잘못된 비밀번호 로그인 | 로그인 페이지 유지 |
| 비로그인 상태 보호 라우트 접근 | `/login` 리다이렉트 |

### 코스 탐색 시나리오 (`e2e/courses.spec.ts`)
| 시나리오 | 기대 결과 |
|---|---|
| 홈 페이지 로드 | 타이틀 노출 |
| 코스 목록 페이지 접근 | URL 유지 |
| 코스 상세 페이지 이동 | `/courses/:id` URL |

---

## 실행 명령어

```bash
# 백엔드 유닛 테스트
cd P3/server && npm test

# 프론트 유닛 테스트
cd P3/client && npm test

# e2e 테스트 (앱 실행 후)
cd P3/client && npx playwright test
```

---

## 제외 범위

- 외부 API (토스페이먼츠, 이메일 SMTP) — 목 처리
- DB 연결 — 유닛 테스트에서 Repository 목 처리
- Redis — 유닛 테스트에서 CacheManager 목 처리
