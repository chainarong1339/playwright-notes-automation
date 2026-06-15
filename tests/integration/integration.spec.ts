import { test, expect } from '@playwright/test';
import { getToken } from '../../utils/auth';

test.use({ storageState: { cookies: [], origins: [] } });   // ไม่ใช้ session (login เอง)

test('สร้าง note ผ่าน API แล้วเช็คว่าโผล่ใน UI', async ({ request, page }) => {
  // 1. register + login เอา token, email, password (ใช้ helper)
  const { token, email, password } = await getToken(request);

  // 2. สร้าง note ผ่าน API (title เฉพาะ)
  const noteTitle = `API Note ${Date.now()}`;
  await request.post('notes', {
    headers: { 'x-auth-token': token },
    form: { title: noteTitle, description: 'from API', category: 'Home' }
  });

  // 3. login ผ่าน UI ด้วย email/password เดียวกัน
  
  // บล็อกโฆษณาก่อน เพื่อไม่ให้ ad เด้งมากวน test
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.includes('ads') || url.includes('doubleclick') || url.includes('googlesyndication') || url.includes('fiverr')) {
      route.abort();   // บล็อก request โฆษณา
    } else {
      route.continue();   // ปล่อย request ปกติผ่าน
    }
  });
  await page.goto('https://practice.expandtesting.com/notes/app/login');
  await page.locator('[data-testid="login-email"]').fill(email);
  await page.locator('[data-testid="login-password"]').fill(password);
  await page.locator('[data-testid="login-submit"]').click();

  // 4. เช็คว่า note ที่สร้างผ่าน API โผล่ใน UI
  await expect(page.locator('[data-testid="note-card-title"]', { hasText: noteTitle })).toBeVisible();
});