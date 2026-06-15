import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: `e2e_${Date.now()}@test.com`,
  password: 'Test1234!',
  nickname: 'e2e테스터',
};

test.describe('인증 플로우', () => {
  test('회원가입 후 로그인 성공', async ({ page }) => {
    // 회원가입
    await page.goto('/signup');
    await page.getByPlaceholder(/이메일/).fill(TEST_USER.email);
    await page.getByPlaceholder(/비밀번호/).first().fill(TEST_USER.password);
    await page.getByPlaceholder(/닉네임/).fill(TEST_USER.nickname);
    await page.getByRole('button', { name: /회원가입/ }).click();

    // 회원가입 후 로그인 페이지로 이동
    await expect(page).toHaveURL(/login/);

    // 로그인
    await page.getByPlaceholder(/이메일/).fill(TEST_USER.email);
    await page.getByPlaceholder(/비밀번호/).fill(TEST_USER.password);
    await page.getByRole('button', { name: /로그인/ }).click();

    // 홈으로 이동 확인
    await expect(page).toHaveURL('/');
  });

  test('잘못된 비밀번호로 로그인 실패', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/이메일/).fill('notexist@test.com');
    await page.getByPlaceholder(/비밀번호/).fill('wrongpassword');
    await page.getByRole('button', { name: /로그인/ }).click();

    // 에러 메시지 노출 또는 로그인 페이지 유지
    await expect(page).toHaveURL(/login/);
  });

  test('로그인 없이 보호 라우트 접근 시 로그인 페이지로 이동', async ({ page }) => {
    await page.goto('/my-courses');
    await expect(page).toHaveURL(/login/);
  });
});
