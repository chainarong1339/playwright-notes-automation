# Playwright Notes Automation

โปรเจกต์ทดสอบอัตโนมัติ (Test Automation) ด้วย **Playwright + TypeScript** ทดสอบเว็บแอป [Notes App ของ expandtesting](https://practice.expandtesting.com/notes/app) ครอบคลุมทั้ง **API, UI และ Integration** พร้อมการจัดการ session และ flaky test

โปรเจกต์นี้เน้นการ**ตัดสินใจเชิงทดสอบ** (test strategy) ไม่ใช่แค่เขียนเทสให้ผ่าน เช่น เลือก layer ที่เหมาะกับแต่ละเคส จัดการ authentication อย่างมีประสิทธิภาพ และทำให้เทสเสถียร

## Tech Stack

- **Playwright** — test framework
- **TypeScript** — ภาษาที่ใช้เขียนเทส
- **Page Object Model** — แยก locator ออกจาก test logic

## สิ่งที่ทดสอบ (Coverage)

| ประเภท | สิ่งที่ครอบคลุม |
|--------|----------------|
| **API** | CRUD ครบ (สร้าง/อ่าน/แก้/ลบ note) + authentication + negative cases (token หาย, password ผิด, validation) |
| **UI** | สร้างและลบ note ผ่านหน้าจอจริง ตรวจสอบสิ่งที่ user เห็น |
| **Integration** | สร้าง note ผ่าน API แล้วตรวจสอบว่าแสดงผลถูกต้องบน UI |
| **OAuth** | ทดสอบ redirect ของ Google login + ตรวจสอบ OAuth parameters |
| **Session** | storageState — login ครั้งเดียวแล้วนำ session กลับมาใช้ซ้ำ |

## โครงสร้างโปรเจกต์

```
tests/
├── api/            # API tests (CRUD + negative)
├── auth/           # login UI + Google OAuth
├── integration/    # API + UI ทำงานร่วมกัน
├── notes-ui/       # สร้าง/ลบ note ผ่าน UI
├── secure/         # ทดสอบการใช้ session ซ้ำ
└── auth.setup.ts   # เตรียม session (login ครั้งเดียว)

pages/              # Page Object (locator + actions)
utils/
├── auth.ts         # helper: login ผ่าน API (ได้ token)
└── ui-auth.ts      # helper: login ผ่าน UI
test-data/          # ข้อมูลทดสอบแยกจาก code
```

## Test Strategy — เหตุผลเบื้องหลังการตัดสินใจ

### แบ่ง coverage ตาม layer (Test Pyramid)

ทดสอบ business logic (validation, CRUD, auth) ที่ **API layer** เป็นหลัก เพราะเร็วและเสถียรกว่า ส่วน **UI test** เน้นเฉพาะสิ่งที่ต้องเห็นด้วยตา (การแสดงผล card, การลบออกจากหน้าจอ) ไม่ทดสอบ logic ซ้ำที่ API ทำไปแล้ว

### Integration ใช้ API เตรียมข้อมูล

Integration test ใช้ API สร้าง note (เร็ว) แล้วใช้ UI ตรวจสอบว่าแสดงผลถูกต้อง — ได้ทั้งความเร็วและความมั่นใจว่า user เห็นสิ่งที่ถูกต้อง

### Authentication Strategy

โปรเจกต์ใช้ **storageState** เพื่อ login ครั้งเดียวแล้วนำ session กลับมาใช้ซ้ำ (ผ่าน setup project) แทนที่จะ login ใหม่ทุกเทส ซึ่งเร็วกว่าและลดความซ้ำซ้อน

**กรณี Google login** — ทดสอบเฉพาะฝั่งที่เป็นความรับผิดชอบของเรา คือ **redirect ไป Google พร้อม OAuth parameters ที่ถูกต้อง** (client_id, redirect_uri, scope) ไม่ทดสอบการ login เข้า Google จริง เพราะ:

- Google มี **bot detection** ทำให้เทสไม่เสถียร (flaky)
- เป็น **third-party** ที่อยู่นอกขอบเขตระบบของเรา (out of system under test)
- UI ของ Google เปลี่ยนได้โดยเราควบคุมไม่ได้

หากต้องทดสอบ flow หลัง login จริง วิธีที่เหมาะคือ **mock OAuth provider** หรือใช้ **API login + storageState** เพื่อข้ามขั้นตอน Google แล้วไปทดสอบ feature ที่อยู่หลัง login โดยตรง

### การจัดการ Flaky Test

- **โฆษณา** — เว็บมีโฆษณาที่เด้งมารบกวนเทส แก้ด้วยการ block ad request ตั้งแต่ก่อนโหลดหน้า (network interception)
- **Locator ที่เจาะจง** — เทสลบ note ใช้การ scope locator ให้เล็งเฉพาะ card ที่เทสสร้างเอง (chain locator จาก container) ไม่เล็งทั้งหน้าจอ เพื่อให้เทสทำงานถูกต้องไม่ว่าหน้าจอจะมี note กี่อัน

### หลีกเลี่ยงการผูกกับ Environment

ตอนเช็ค URL ที่ redirect ไป Google เลือกเช็คเฉพาะค่าที่คงที่และมีความหมาย เช่น path ของ redirect_uri และ scope ส่วนค่าที่เปลี่ยนตาม environment (เช่น client_id เต็ม, domain) หรือค่าที่สุ่มทุกครั้ง (state) จะเช็คแค่ว่า "มีอยู่จริง" ไม่เช็คค่าตายตัว เพื่อให้เทสรันผ่านได้ทุก environment ไม่พังเวลาย้ายจาก dev ไป production

## วิธีรัน

```bash
# ติดตั้ง dependencies
npm install
npx playwright install

# รันเทสทั้งหมด
npx playwright test --project=chromium

# รันเฉพาะกลุ่ม
npx playwright test api --project=chromium
npx playwright test notes-ui --project=chromium

# ดูรายงานผล
npx playwright show-report
```

## หมายเหตุ

โปรเจกต์นี้เป็นส่วนหนึ่งของการฝึกฝน test automation โดยเน้นความเข้าใจในหลักการและการตัดสินใจเชิงทดสอบ มากกว่าการเพิ่มจำนวนเทสเคส