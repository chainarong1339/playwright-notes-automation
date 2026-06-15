import { test, expect } from '@playwright/test';
import { getToken } from '../../utils/auth';
import { loginViaUI } from '../../utils/ui-auth';

test.use({ storageState: { cookies: [], origins: [] } });   // ไม่ใช้ session (login เอง)

test('สร้าง note ผ่าน UI เห็น card บนจอ', async({ request, page}) =>{
    // 1. login (ใช้ helper เอา email/password)
    const { email, password } = await getToken(request);

    // login ผ่าน UI
    await loginViaUI(page, email, password);                // login ด้วย helper บรรทัดเดียว


    // 2. กดเปิด modal สร้าง note
    await page.locator('[data-testid="add-new-note"]').click();

    // 3. กรอกฟอร์ม (category = selectOption, ที่เหลือ = fill)
    const noteTitle = `UI Note ${Date.now()}`;
    await page.locator('[data-testid="note-category"]').selectOption('Home');
    await page.locator('[data-testid="note-title"]').fill(noteTitle);
    await page.locator('[data-testid="note-description"]').fill('This is a test note description');

    // 4. กด submit
    await page.locator('[data-testid="note-submit"]').click();
    // 5. เช็คว่า card ที่มี title นั้นโผล่บนจอ
    await expect(page.locator('[data-testid="note-card-title"]', { hasText: noteTitle })).toBeVisible();
})

test('ลบ note ผ่าน UI card หายจากจอ', async ({ request, page }) => {

    // 1. login (ใช้ helper เอา email/password)
    const { email, password } = await getToken(request);

    // login ผ่าน UI
    await loginViaUI(page, email, password);                // login ด้วย helper บรรทัดเดียว

    // 2. กดเปิด modal สร้าง note
    await page.locator('[data-testid="add-new-note"]').click();

    // 3. กรอกฟอร์ม (category = selectOption, ที่เหลือ = fill)
    const noteTitle = `UI Note ${Date.now()}`;
    await page.locator('[data-testid="note-category"]').selectOption('Home');
    await page.locator('[data-testid="note-title"]').fill(noteTitle);
    await page.locator('[data-testid="note-description"]').fill('This is a test note description');

    // 4. กด submit
    await page.locator('[data-testid="note-submit"]').click();

    // เช็คว่า card โผล่ก่อน (ยืนยันว่ามี note จริงก่อนลบ)
    await expect(page.locator('[data-testid="note-card-title"]', { hasText: noteTitle })).toBeVisible();

    // ลบ: กดปุ่มลบ → กดยืนยัน
    // หา card ที่มี title ของเรา
    const myCard = page.locator('[data-testid="note-card"]', { hasText: noteTitle });

    // หาปุ่ม delete ข้างใน card นั้น (ไม่ใช่ทั้งจอ)
    await myCard.locator('[data-testid="note-delete"]').click();
    await page.locator('[data-testid="note-delete-confirm"]').click();

    // เช็คว่า card หายแล้ว
    await expect(page.locator('[data-testid="note-card-title"]', { hasText: noteTitle })).not.toBeVisible();
});