import { test, expect } from '@playwright/test';


// ขั้น 1: เริ่มจากยังไม่ login (ไม่ใช้ session เก่า)
test.use({ storageState: { cookies: [], origins: [] } });

// เทสนี้เทสแค่ฝั่งเว็ปไม่ได้เทสฝั่ง Google ไม่ login Google จริง เพราะ bot detection + เป็น third-party นอก system under test ถ้าจะเทส flow หลัง login → ใช้ mock OAuth หรือ storageState

test('กดปุ่ม Google แล้ว redirect ไป Google ด้วย OAuth params ที่ถูกต้อง', async({ page }) => {
    // ขั้น 2: ไปหน้า notes login
    await page.goto('https://practice.expandtesting.com/notes/app/login');
    await page.locator('[data-testid="login-with-google"]').click();
    await page.waitForURL(/accounts\.google\.com/);

    const url = new URL(page.url());
    expect(url.searchParams.get('client_id')).toBeTruthy();                              // มีอยู่ ไม่ผูกค่า
    expect(url.searchParams.get('redirect_uri')).toContain('/notes/app/auth/google/callback');  // assert path ไม่ผูก domain
    expect(url.searchParams.get('scope')).toContain('profile');                         // logic ของเรา
    expect(url.searchParams.get('scope')).toContain('email');
    expect(url.searchParams.get('response_type')).toBe('code');                          // logic ของเรา (คงที่)
    expect(url.searchParams.get('state')).toBeTruthy();                                  // มีอยู่ ไม่ผูกค่า
});

