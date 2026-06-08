# Solving Meal — 자취생 맞춤형 요리 교육 플랫폼

## 개요

**Solving Meal**은 자취 생활을 시작한 사람들을 위한 요리 교육 플랫폼입니다. 초보자도 쉽게 따라할 수 있는 단계별 강좌, 수강 진도 추적, 강사와 학생을 구분한 역할 기반 접근 제어, 그리고 Toss Payments를 통한 안전한 결제 시스템을 갖추고 있습니다. NestJS 백엔드와 React 프론트엔드로 구성된 풀스택 프로젝트이며, Docker를 통해 로컬 및 운영 환경을 동일하게 관리합니다.

---

## 기술 스택

### 백엔드
| 기술 | 버전 | 용도 |
|------|------|------|
| NestJS | 10.x | 서버 프레임워크 |
| TypeORM | 0.3.x | ORM 및 마이그레이션 |
| PostgreSQL | 15 | 주 데이터베이스 |
| Redis | 7 | 캐싱, 토큰 블랙리스트 |
| Passport / JWT | - | 인증 (Access + Refresh Token) |
| BullMQ | - | 작업 큐 (이메일 발송, 스케줄러) |
| Swagger | - | API 문서 자동화 |
| Winston | - | 구조화 로그 |

### 프론트엔드
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 18.x | UI 라이브러리 |
| TypeScript | 5.x | 타입 안전성 |
| React Query | 5.x | 서버 상태 관리 |
| React Router | 6.x | 클라이언트 라우팅 |
| Vite | 5.x | 빌드 도구 |
| Axios | - | HTTP 클라이언트 |

### 인프라 및 결제
| 기술 | 용도 |
|------|------|
| Docker / Docker Compose | 컨테이너화 및 로컬 개발 환경 |
| Toss Payments | 결제 처리 (신용카드, 카카오페이 등) |
| Nodemailer + Gmail SMTP | 이메일 발송 (회원가입 환영, 결제 완료) |

---

## 주요 기능

### 인증 및 보안
- **JWT RTR(Refresh Token Rotation) 전략**: Access Token(15분) + Refresh Token(7일) 발급 및 자동 갱신
- **RBAC(역할 기반 접근 제어)**: `STUDENT`, `INSTRUCTOR`, `ADMIN` 세 가지 역할 구분
- **비밀번호 보안**: bcrypt 해싱
- **SQL Injection / XSS 방어**: TypeORM 파라미터 바인딩, helmet 미들웨어

### 강좌 관리
- 강좌 CRUD (강사/관리자만 생성 및 수정 가능)
- 강좌 목록 필터링 및 검색
- `requiredTools` 필드를 JSONB로 저장 (필요 조리도구 목록)
- Redis 캐싱으로 목록 조회 응답 시간 850ms → 45ms 개선

### 수강 및 진도 관리
- 강좌 수강 신청 및 결제 연동
- 수강 진도율 추적 (`progressRate` 필드)
- 수강 완료 처리 및 이력 관리

### 결제 시스템
- Toss Payments 위젯 기반 결제 플로우 (프론트엔드)
- 결제 확인 서버 검증 (`POST /api/v1/payments/confirm`)
- Webhook 수신으로 비동기 결제 상태 업데이트
- 결제 완료 시 자동 이메일 발송

### 부가 기능
- 강좌 북마크 (찜 목록)
- 수강 완료 후 리뷰 작성 및 별점 평가
- 관리자 대시보드용 통계 API

---

## 개발 단계 요약

### P1 — 기초 CRUD (2026-02 ~ 2026-03)
- NestJS 프로젝트 초기 설정 및 모듈 구조 설계
- PostgreSQL + TypeORM 연동, 엔티티 설계
- 강좌, 수강, 리뷰, 북마크, 사용자 REST API 구현
- Swagger 자동 문서화 적용

### P2 — JWT 인증 + RBAC (2026-03 ~ 2026-04)
- JWT Access + Refresh Token RTR 전략 구현
- `STUDENT`, `INSTRUCTOR`, `ADMIN` 역할 기반 접근 제어
- `RolesGuard`, `@Roles()` 커스텀 데코레이터
- Redis를 이용한 토큰 블랙리스트 관리
- React 프론트엔드 인증 흐름 구현 (로그인/로그아웃/토큰 갱신)

### P3 — 결제 + 스케줄러 + 모니터링 (2026-04 ~ 2026-06)
- Toss Payments 결제 연동 및 Webhook 처리
- BullMQ 기반 이메일 발송 큐
- Redis 캐싱으로 API 성능 개선
- Winston 구조화 로그 및 헬스체크 엔드포인트
- Docker Compose 운영 환경 구성

---

## 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────┐
│                     클라이언트 (React)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │  강좌 목록  │  │  결제 위젯  │  │  수강 진도 / 리뷰 / 북마크 │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS / REST API
┌─────────────────────▼───────────────────────────────────┐
│                  NestJS 백엔드                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Auth    │  │ Courses  │  │Payments  │  │Reviews │  │
│  │  Module  │  │  Module  │  │  Module  │  │Module  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
│       │             │              │              │       │
│  ┌────▼─────────────▼──────────────▼──────────────▼───┐  │
│  │              TypeORM (Repository Layer)              │  │
│  └─────────────────────────┬───────────────────────────┘  │
└────────────────────────────┼────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
   ┌──────▼──────┐   ┌───────▼──────┐  ┌───────▼──────┐
   │ PostgreSQL  │   │    Redis     │  │ Toss Payments │
   │  (주 DB)   │   │(캐시/토큰)   │  │  (외부 API)   │
   └─────────────┘   └──────────────┘  └──────────────┘
```

---

## 실행 방법

### 사전 조건
- Docker Desktop 설치
- `.env` 파일 설정

### 환경변수 설정

```bash
# .env 파일 생성
cp .env.example .env
# 필수 환경변수 설정:
# DATABASE_URL, REDIS_URL, JWT_SECRET, TOSS_SECRET_KEY 등
```

### 실행

```bash
# 전체 서비스 실행 (백엔드 + 프론트엔드 + DB + Redis)
docker compose up -d

# 상태 확인
docker compose ps

# 헬스체크
curl http://localhost:3000/api/v1/health
```

### 접속 주소
- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:3000/api/v1
- Swagger 문서: http://localhost:3000/api/v1/docs

---

## 문서 링크

| 문서 | 경로 |
|------|------|
| P1 회고 | `docs/p1/retrospective.md` |
| 운영 Runbook | `docs/p3/runbook.md` |
| 장애 보고서 샘플 | `docs/p3/incident-report-sample.md` |
| 성능 개선 기록 | `docs/p3/perf-notes.md` |
| ADR-001: JWT 인증 | `docs/adr/001-jwt-auth.md` |
| ADR-002: PostgreSQL | `docs/adr/002-postgresql.md` |
| ADR-003: Toss Payments | `docs/adr/003-toss-payments.md` |
| 최종 회고 | `final-retrospective.md` |
