import { Page } from '@playwright/test';

export async function loginViaUI(page: Page, email: string, password: string) {
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.includes('ads') || url.includes('doubleclick') || url.includes('googlesyndication') || url.includes('fiverr')) {
      route.abort();
    } else {
      route.continue();
    }
  });  
  await page.goto('https://practice.expandtesting.com/notes/app/login');
  await page.locator('[data-testid="login-email"]').fill(email);
  await page.locator('[data-testid="login-password"]').fill(password);
  await page.locator('[data-testid="login-submit"]').click();
}