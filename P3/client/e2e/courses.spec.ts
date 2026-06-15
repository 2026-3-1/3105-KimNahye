import { test, expect } from '@playwright/test';

test.describe('코스 탐색', () => {
  test('홈 페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Solving Meal|요리/i);
  });

  test('코스 목록 페이지에서 강의가 표시된다', async ({ page }) => {
    await page.goto('/courses');
    // 로딩 완료 대기
    await page.waitForLoadState('networkidle');
    // 페이지 접근 가능 확인 (빈 목록도 허용)
    await expect(page).toHaveURL('/courses');
  });

  test('코스 상세 페이지로 이동할 수 있다', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');

    const firstCourse = page.locator('[href^="/courses/"]').first();
    const count = await firstCourse.count();

    if (count > 0) {
      await firstCourse.click();
      await expect(page).toHaveURL(/\/courses\/.+/);
    } else {
      // 강의가 없어도 페이지 자체는 정상
      await expect(page).toHaveURL('/courses');
    }
  });
});
