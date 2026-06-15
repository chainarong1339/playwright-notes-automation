import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // login ด้วย UI ปกติ
  await page.goto('https://practice.expandtesting.com/login');
  await page.locator('#username').fill('practice');
  await page.locator('#password').fill('SuperSecretPassword!');
  await page.locator('#submit-login').click();

  // รอให้ login สำเร็จ (ไปหน้า secure)
  await page.waitForURL('**/secure');

  // เซฟ session ลงไฟล์
  await page.context().storageState({ path: authFile });
});