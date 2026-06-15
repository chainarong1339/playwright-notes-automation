import { APIRequestContext } from '@playwright/test';

export async function getToken(request: APIRequestContext) {
  const email = `test${Date.now()}@test.com`;
  const password = 'Password123!';

  await request.post('users/register', {
    form: { name: 'Test User', email, password }
  });

  const loginResponse = await request.post('users/login', {
    form: { email, password }
  });
  const body = await loginResponse.json();
  return { token: body.data.token, email, password };
}