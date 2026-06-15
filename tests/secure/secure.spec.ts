import { test, expect } from '@playwright/test';

test('เข้าหน้า secure ได้เลยไม่ต้อง login', async ({ page }) => {
  // เข้า /secure ตรงๆ (มี session แล้ว ไม่ต้อง login)
  await page.goto('https://practice.expandtesting.com/secure');

  // เช็คว่าเข้าได้จริง (อยู่หน้า secure ไม่โดนเด้งกลับ login)
  await expect(page).toHaveURL(/secure/);
});