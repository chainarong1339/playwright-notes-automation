import { test, expect } from '@playwright/test';
import { getToken } from '../../utils/auth';


test('health check', async ({ request }) => {
  const response = await request.get('health-check');
  expect(response.status()).toBe(200);
});

test('Register สำเร็จ', async({ request}) => {
    const email = `test${Date.now()}@test.com`;
    const response = await request.post('users/register',{
        form: {
            name: 'Test User' ,
            email: email,
            password: 'Password123!'
        }
    });
    expect(response.status()).toBe(201);
});


test('login เอา token', async ({ request }) => {
  // 1. สุ่ม email + register ก่อน
  const email = `test${Date.now()}@test.com`;
  const password = 'Password123!';
  
  await request.post('users/register', {
    form: { name: 'Test User', email: email, password: password }
  });

  // 2. login ด้วย email เดียวกัน
  const response = await request.post('users/login', {
    form: { email: email, password: password }
  });
  expect(response.status()).toBe(200);

  // 3. ดึง token จาก response
  const body = await response.json();
  const token = body.data.token;
  expect(token).toBeTruthy();   // เช็คว่ามี token จริง
});


test('สร้าง note ด้วย token', async ({ request }) => {
  const { token } = await getToken(request);   // ← แกะเอาแค่ token
  // 2. สร้าง note โดยส่ง token ใน header
  const noteResponse = await request.post('notes', {
    headers: {
      'x-auth-token': token   // ← ส่ง token ตรงนี้
    },
    form: {
      title: 'My Test Note',
      description: 'This is a test note',
      category: 'Home'        // ต้องเป็น Home/Work/Personal
    }
  });
  expect(noteResponse.status()).toBe(200);
});


test('ดู notes ทั้งหมด', async ({ request }) => {
  const { token } = await getToken(request);   // ← แกะเอาแค่ token

  // 2. ดู notes ทั้งหมด
  const noteResponse = await request.get('notes', {
    headers: {
      'x-auth-token': token   // ← ส่ง token ตรงนี้
    },
  });
  expect(noteResponse.status()).toBe(200);
});


test('เเก้ไข note ด้วย id', async ({ request }) => {
  const { token } = await getToken(request);   // ← แกะเอาแค่ token

  // 2. สร้าง note โดยส่ง token ใน header
  const noteResponse = await request.post('notes', {
    headers: {
      'x-auth-token': token   // ← ส่ง token ตรงนี้
    },
    form: {
      title: 'My Test Note',
      description: 'This is a test note',
      category: 'Home'        // ต้องเป็น Home/Work/Personal
    }
  });
  expect(noteResponse.status()).toBe(200);

  // 3. เเก้ไข note โดยส่ง token ใน header
  const noteBody = await noteResponse.json();
  const noteId = noteBody.data.id;   // ดึง id ออกมา
  const EditnoteResponse = await request.put(`notes/${noteId}`, {
    headers: {
      'x-auth-token': token   // ← ส่ง token ตรงนี้
    },
    form: {
      title: 'Update My Test Note',
      description: 'Update This is a test note',
      completed: true ,
      category: 'Work'        // ต้องเป็น Home/Work/Personal
    }
  });
  expect(EditnoteResponse.status()).toBe(200);
});

test('ลบ note ด้วย id', async ({ request }) => {
  const { token } = await getToken(request);   // ← แกะเอาแค่ token

  // 2. สร้าง note โดยส่ง token ใน header
  const noteResponse = await request.post('notes', {
    headers: {
      'x-auth-token': token   // ← ส่ง token ตรงนี้
    },
    form: {
      title: 'My Test Note',
      description: 'This is a test note',
      category: 'Home'        // ต้องเป็น Home/Work/Personal
    }
  });
  expect(noteResponse.status()).toBe(200);

  // 3. ลบ note โดยส่ง token ใน header
  const noteBody = await noteResponse.json();
  const noteId = noteBody.data.id;   // ดึง id ออกมา
  const DeleteResponse = await request.delete(`notes/${noteId}`, {
    headers: {
      'x-auth-token': token   // ← ส่ง token ตรงนี้
    },
  });
  expect(DeleteResponse.status()).toBe(200);
});


// negative test


test('เรียก notes ไม่ส่ง token ได้ 401', async ({ request }) => {
  const noteResponse = await request.get('notes');
  expect(noteResponse.status()).toBe(401);
});


test('login password ผิด ได้ 401', async ({ request }) => {
  // 1. สุ่ม email + register ก่อน
  const email = `test${Date.now()}@test.com`;
  const password = 'Password123!';
  
  await request.post('users/register', {
    form: { name: 'Test User', email: email, password: password }
  });

  // 2. login ด้วย email เดียวกัน
  const response = await request.post('users/login', {
    form: { email: email, password: 'Password111!' }
  });
  expect(response.status()).toBe(401);
});

test('สร้าง note category ผิด ได้ 400', async ({ request }) => {
  const { token } = await getToken(request);   // ← แกะเอาแค่ token
  // 2. สร้าง note โดยส่ง token ใน header
  const noteResponse = await request.post('notes', {
    headers: {
      'x-auth-token': token   // ← ส่ง token ตรงนี้
    },
    form: {
      title: 'My Test Note',
      description: 'This is a test note',
      category: 'abc'        // ต้องเป็น Home/Work/Personal
    }
  });
  expect(noteResponse.status()).toBe(400);
});