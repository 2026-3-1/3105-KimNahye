# CI/CD 가이드 — Solving Meal

## 브랜치 전략 (GitHub Flow)

```
main ← 항상 배포 가능한 상태 유지
  ↑
feature/xxx  ← 기능 개발 후 PR → main
fix/xxx      ← 버그 수정 후 PR → main
```

### 규칙
- `main` 브랜치 직접 push 금지
- 모든 변경은 PR을 통해 병합
- PR 병합 전 CI 통과 필수

---

## 커밋 규칙 (Conventional Commits)

```
<type>(<scope>): <subject>

예시:
feat(auth): JWT RTR 방식 로그인 구현
fix(payment): 결제 금액 변조 방지 로직 추가
docs(p3): Runbook 작성
test(auth): AuthService 유닛 테스트 추가
chore(deps): helmet 패키지 추가
```

| type | 설명 |
|---|---|
| feat | 새 기능 |
| fix | 버그 수정 |
| docs | 문서 변경 |
| test | 테스트 추가/수정 |
| refactor | 리팩토링 |
| chore | 빌드/설정 변경 |

---

## GitHub Actions CI (`.github/workflows/ci.yml`)

### 트리거
- `main`, `develop` 브랜치 push
- PR 대상 브랜치가 `main`, `develop`

### 백엔드 파이프라인

```
Checkout → Node 20 설치 → npm ci → lint → build → test
```

### 프론트엔드 파이프라인

```
Checkout → Node 20 설치 → npm ci → lint → build
```

---

## GitHub Actions CD (`.github/workflows/cd.yml`)

### 트리거
- `main` 브랜치 push (CI 통과 후)

### 파이프라인

```
1. Docker Hub 로그인
2. 백엔드 이미지 빌드 + push
   → 3n1hye/solvingmeal-backend:latest
   → 3n1hye/solvingmeal-backend:sha-{SHA}
3. 프론트엔드 이미지 빌드 + push
   → 3n1hye/solvingmeal-frontend:latest
   → 3n1hye/solvingmeal-frontend:sha-{SHA}
4. EC2 SSH 접속
   → docker compose pull
   → docker compose up -d
   → docker image prune -f
5. 실패 시 Slack 알림
```

### 필요한 GitHub Secrets

| Secret | 설명 |
|---|---|
| `DOCKER_USERNAME` | Docker Hub 사용자명 |
| `DOCKER_PASSWORD` | Docker Hub 토큰 |
| `SSH_HOST` | EC2 IP 주소 |
| `SSH_USER` | EC2 접속 사용자명 |
| `SSH_PRIVATE_KEY` | EC2 SSH 개인키 |
| `SLACK_WEBHOOK_URL` | (선택) 슬랙 알림 Webhook |
| `SENTRY_DSN` | Sentry 프로젝트 DSN |
