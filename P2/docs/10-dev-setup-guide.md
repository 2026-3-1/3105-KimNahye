# Solving Meal — 개발 환경 세팅 가이드

## 사전 요구사항

| 도구 | 버전 | 설치 확인 |
|---|---|---|
| Node.js | 20 이상 | `node -v` |
| npm | 10 이상 | `npm -v` |
| PostgreSQL | 15 이상 | `psql --version` |
| Git | - | `git --version` |

---

## 1. 저장소 클론

```bash
git clone <repo-url>
cd solving-meal
```

---

## 2. 데이터베이스 준비

```bash
# PostgreSQL 접속
psql -U postgres

# DB 생성
CREATE DATABASE solving_meal;

# 비밀번호 설정 (예시)
ALTER USER postgres PASSWORD 'yourpassword';

# 확인
\l
\q
```

---

## 3. 백엔드 세팅

```bash
cd server
npm install
```

### 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일 편집:

```env
NODE_ENV=dev
PORT=8080

DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/solving_meal

# 강력한 시크릿 생성 (각각 다른 값)
JWT_SECRET_KEY=your-32-byte-secret-here
JWT_REFRESH_SECRET_KEY=your-another-32-byte-secret

JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# 토스페이먼츠 (테스트 키)
TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...
```

> 시크릿 생성: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 백엔드 실행

```bash
# 개발 모드 (파일 변경 감지 자동 재시작)
npm run start:dev

# 서버 확인
# http://localhost:8080
# http://localhost:8080/api/docs  (Swagger)
```

`NODE_ENV=dev`일 때 TypeORM `synchronize: true`로 DB 테이블이 자동 생성됩니다.

---

## 4. 프론트엔드 세팅

```bash
cd ../client
npm install
```

### 환경변수 설정

```bash
# .env 파일 생성
echo "VITE_API_URL=http://localhost:8080/api/v1" > .env
```

### 프론트엔드 실행

```bash
npm run dev

# 브라우저: http://localhost:5173
```

---

## 5. 동시 실행 (터미널 2개)

**터미널 1 — 백엔드:**
```bash
cd server && npm run start:dev
```

**터미널 2 — 프론트엔드:**
```bash
cd client && npm run dev
```

---

## 6. Docker로 PostgreSQL 실행 (선택)

PostgreSQL 로컬 설치 대신 Docker를 사용할 수 있습니다.

```bash
docker run --name solving-meal-db \
  -e POSTGRES_DB=solving_meal \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -p 5432:5432 \
  -d postgres:15

# 연결 확인
docker exec -it solving-meal-db psql -U postgres -d solving_meal
```

---

## 7. 초기 테스트 계정 생성

서버 실행 후 Swagger(`/api/docs`) 또는 curl로 계정을 생성합니다.

```bash
# 선생님 계정 생성
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@test.com",
    "password": "test1234",
    "nickname": "테스트선생님",
    "role": "teacher"
  }'

# 학생 계정 생성
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "test1234",
    "nickname": "테스트학생",
    "role": "student"
  }'

# 로그인 후 토큰 획득
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher@test.com", "password": "test1234"}'
```

---

## 8. 자주 발생하는 문제

| 증상 | 원인 | 해결 |
|---|---|---|
| `getOrThrow('JWT_SECRET_KEY')` 에러 | .env 미설정 | .env 파일 확인 |
| TypeORM 연결 실패 | DB 미실행 또는 URL 오류 | PostgreSQL 서비스 실행 확인 |
| `401 Unauthorized` 모든 요청 | accessToken 누락 | Zustand isAuthenticated + 토큰 확인 |
| CORS 에러 | 프론트/백엔드 포트 불일치 | VITE_API_URL 확인 |
| `409 Conflict` 회원가입 | 이메일 중복 | 다른 이메일 사용 |

---

## 9. 유용한 명령어

```bash
# 백엔드 빌드
cd server && npm run build

# 프로덕션 실행
cd server && npm run start:prod

# 린트
npm run lint

# 테스트
npm run test
npm run test:cov   # 커버리지 포함

# Swagger JSON 추출
curl http://localhost:8080/api/docs-json > swagger.json
```
