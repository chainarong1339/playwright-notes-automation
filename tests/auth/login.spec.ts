import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import users from '../../test-data/users.json';

test.use({ storageState: { cookies: [], origins: [] } });

let loginPage: LoginPage;

test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
});

test('login สำเร็จ', async({ page }) => {
    await loginPage.login(users.standardUser.username,users.standardUser.password);
    await expect(page).toHaveURL(/secure/);
});

test('login ไม่สำเร็จ', async({ page }) => {
    await loginPage.login(users.invalidUser.username,users.invalidUser.password);
    await expect(page.locator('#flash')).toBeVisible();
    await expect(page.locator('#flash')).toContainText('Your username is invalid!');
});