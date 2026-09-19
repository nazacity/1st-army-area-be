# BOOTSTRAP IMPORT API — ยิงผ่าน Swagger ครั้งเดียว จบบน server ใหม่

> สถานะ: **implemented (BE)** — สร้าง 2026-09-19 · ตรวจ `/bootstrap/status` ผ่าน (hasSuperAdmin จาก JWT super_admin)
> จุดประสงค์: deploy BE ขึ้น server ใหม่ (เช่น prod) → กดปุ่มเดียวใน Swagger พร้อมไฟล์ CSV → DB พร้อมใช้ทันที (super_admin + พวก + ห้อง + กำลังพลทั้งหมด)

---

## 1. ปัญหาที่แก้

ตอนนี้ขึ้น server ใหม่ต้องทำมือ 4 ขั้น:

```
1. npm run seed:personnel-admin -- padmin xxx   (สร้างแอดมิน)
2. synchronize สร้างตาราง — พวก/ห้องยังว่าง
3. seed พวก 1–9 + ห้อง 201–710 (ซ่อนอยู่ใน import helper)
4. import CSV กำลังพล (ต้องเข้า server รัน npm script)
```

→ รวมเป็น **endpoint เดียว** กดจาก Swagger: `POST /api/bootstrap/import` (multipart CSV)

---

## 2. สิ่งที่ endpoint ทำ (ตามลำดับ)

```
POST /api/bootstrap/import   (multipart: file CSV, optional body: mode)
│
├─ 1. ensureSuperAdmin
│     ถ้าตาราง personnel_admin ไม่มี super_admin เลย
│     → สร้าง username=padmin password=SuperSecret123 (bcrypt, role=SUPER_ADMIN)
│     ถ้ามีแล้ว → ข้าม (idempotent — ไม่ reset รหัสใคร)
│
├─ 2. ensureGroups          → พวก 1–9 (สร้างเฉพาะที่ยังไม่มี)
├─ 3. ensureRooms           → ห้อง 201–710 (60 ห้อง, capacity 6)
│
├─ 4. parse CSV → import personnel
│     ตรวจ format จาก header อัตโนมัติ:
│     • รูปแบบ A: Google Forms export (มี "ประทับเวลา"/"วันเกิด") → parser เดิม (normalize ครบ + gen รหัส DDMMYYYY)
│     • รูปแบบ B: CSV ที่ export จากโปรเจ็คนี้ (มี "หมายเลขประจำตัว"+"ฉก." แต่ไม่มี "วันเกิด") → parser ใหม่
│
├─ 5. รายงานผล: created / updated / skipped / warnings (คืน JSON ให้หน้า Swagger)
└─ (mode=replace เท่านั้น) ลบ personnel เดิมทั้งหมดก่อน import
```

---

## 3. รูปแบบ CSV ที่รองรับ

### รูปแบบ A — Google Forms export (28/30 คอลัมน์)
- ครบทุก field: วันเกิด, บัตร ปปช., ทหาร, ที่อยู่, ฯลฯ
- ✅ gen รหัสผ่านตั้งต้น (วันเกิด DDMMYYYY) ได้
- ใช้ logic ใน `personnel-import.helper.ts` เดิมทั้งหมด (normalize จำพวก/ยศ/เหล่า/สถานะสมรส/เบอร์โทร)

### รูปแบบ B — CSV ที่ export จากโปรเจ็คนี้ (12 คอลัมน์)

| คอลัมน์ | field ปลายทาง | map |
|---|---|---|
| หมายเลขประจำตัว | username | match สำหรับ upsert |
| ชั้นยศ | rank | trim |
| ชื่อ / นามสกุล | firstName / lastName | |
| ชื่อเล่น | nickName | |
| จำพวก | type | map เหมือนรูปแบบ A (`ฉก.ทม.รอ.` = type ตัวเอง, ค่าผสม → infer + isSpecialForces) |
| เหล่า | branchOfService | normalizeBranch |
| ฉก. | isSpecialForces | "ใช่"/"✓"/"true" → true |
| พวก | groupId | หา/สร้างจากชื่อพวก |
| ห้อง | roomId | หา room_number, 0/ว่าง → null (พักภายนอก) |
| โทรศัพท์ | phone | normalizePhone (กันเลข 0 หาย, quote text) |
| อีเมล | email | |

⚠️ **ไม่มี: วันเกิด / บัตร ปปช. / ทหาร / ที่อยู่ / น้ำหนัก-ส่วนสูง / กรุ๊ปเลือด ฯลฯ**

### ⚠️ ข้อจำกัดสำคัญของรูปแบบ B — รหัสผ่าน

รหัสตั้งต้น = วันเกิด DDMMYYYY แต่ export ไม่มีวันเกิด → **gen รหัสไม่ได้ ผู้ใช้ login เข้าไม่ได้**

ทางเลือก (เลือก 1 ตอน implement):
1. **แนะนำ**: ปรับหน้า export FE เพิ่มคอลัมน์ `วันเกิด` (+ บัตร ปปช.) → bootstrap ใช้รูปแบบ B+ แล้ว gen รหัสได้เลย
2. bootstrap ตั้งรหัสชั่วคราวให้ทุกคน = username (บังคับเปลี่ยนรหัสครั้งแรกอยู่แล้วผ่าน `isChangePassword=false`) — สะดวกแต่รหัสอ่อน
3. ไม่ gen — แจ้ง warning รายชื่อ, แอดมิน reset-password รายคนภายหลัง (แนวทางเดิม §9.3)

**ข้อ 1 ดีที่สุด** — แก้ FE export เพิ่ม 2 คอลัมน์ แล้ว endpoint รองรับทั้ง A/B/B+ อัตโนมัติ

---

## 4. ความปลอดภัย (สำคัญมาก)

Endpoint นี้สร้างแอดมิน + import ข้อมูล PII ทั้งชุด — **ห้ามเปิดสาธารณะ**

### กลไก guard 2 ชั้น

```
POST /api/bootstrap/import
Header: Authorization: Bearer <personnelAdminJwt role=super_admin>   ← server ที่มีแอดมินแล้ว
   หรือ
Header: x-bootstrap-token: <BOOTSTRAP_TOKEN>                          ← server ใหม่ (ยังไม่มีแอดมิน)
```

| เงื่อนไข | ผล |
|---|---|
| JWT super_admin | ผ่านเสมอ |
| `x-bootstrap-token` ตรง env `BOOTSTRAP_TOKEN` และ `BOOTSTRAP_ENABLED=true` | ผ่าน **เฉพาะเมื่อยังไม่มี super_admin ในระบบ** (กัน brute force หลังตั้งค่าเสร็จ) |
| อื่น ๆ | 401/403 |

### Env เพิ่ม (`.env`)

```
BOOTSTRAP_TOKEN=<สุ่มยาว ๆ>     # ใช้ครั้งแรกบน server ใหม่แล้ว
BOOTSTRAP_ENABLED=true           # ตั้ง false หลัง bootstrap เสร็จ (หรือใช้ JWT ต่อ)
```

### Idempotency / กันพัง

- `ensure*` ทุกตัวตรวจก่อนสร้าง — รันซ้ำได้ ไม่ซ้ำข้อมูล
- personnel: `mode=upsert` (default) — username มีอยู่ → **update** field ที่ CSV มี (รวมย้ายพวก/ห้อง), ไม่มี → insert
- `mode=replace` — **hard DELETE personnel + user_payment + survey2 answers ก่อน** (อันตราย — Swagger ต้องยืนยันผ่าน checkbox ใน body) ใช้เมื่อย้ายจาก DB เก่าทั้งชุด
- `@nestjs/schedule` ไม่เกี่ยว — ทำงาน on-demand เท่านั้น

---

## 5. API Design (Swagger)

```
POST /api/bootstrap/import
Consumes: multipart/form-data
Body:
  file*:        (file) CSV — รูปแบบ A หรือ B (ตรวจอัตโนมัติจาก header)
  mode:         upsert (default) | replace
  adminPassword: (optional) รหัส super_admin ที่จะสร้าง — default "SuperSecret123"
Responses:
  200 { data: {
    superAdmin: { created: true, username: "padmin" },
    groups: { total: 9, created: 9 },
    rooms:  { total: 60, created: 60 },
    personnel: { created: 0, updated: 251, skipped: 0,
                 warnings: [{ username: "105105", reason: "ไม่มีวันเกิด → ยังไม่มีรหัสผ่าน" }] },
    csvFormat: "B (project export)"
  } }
  401/403 guard ไม่ผ่าน
  400 header CSV ไม่รู้จัก / ไฟล์ว่าง
```

Swagger กดได้เลย (เลือกไฟล์ → Try it out) — เหมาะกับขั้นตอน deploy

---

## 6. ไฟล์ที่ต้องเขียน/แก้

| ไฟล์ | งาน |
|---|---|
| `src/modules/bootstrap/bootstrap.module.ts` | module ใหม่ |
| `src/modules/bootstrap/bootstrap.controller.ts` | `POST /bootstrap/import` (multipart, Swagger docs) |
| `src/modules/bootstrap/bootstrap.service.ts` | orchestrate: ensureSuperAdmin → groups → rooms → import |
| `src/modules/bootstrap/bootstrap.guard.ts` | JWT super_admin **หรือ** x-bootstrap-token (+เงื่อนไขไม่มี super_admin) |
| `personnel-import.helper.ts` | export `ensureGroups/ensureRooms` (ปัจจุบัน private), เพิ่ม `importPersonnelExport()` parser รูปแบบ B, upsert mode ใน `importPersonnel` |
| `FE admin personnels export` | (แนะนำ) เพิ่มคอลัมน์ วันเกิด + บัตร ปปช. → แก้ปัญหารหัสผ่านรูปแบบ B |
| `.env` | BOOTSTRAP_TOKEN, BOOTSTRAP_ENABLED |
| `docs/personnel-system-design.md` | เพิ่ม checklist ขั้น deploy |

---

## 7. Checklist

- [x] 7.1 export `ensureGroups`/`ensureRooms` จาก import helper (private → export)
- [x] 7.2 `ensureSuperAdmin(username, password)` — idempotent
- [x] 7.3 parser รูปแบบ B (`importPersonnelExport`) + ตรวจ format จาก header อัตโนมัติ
- [x] 7.4 upsert mode (username ซ้ำ → update รวมพวก/ห้อง) + replace mode (ลบก่อน + ยืนยัน)
- [x] 7.5 BootstrapGuard (JWT super_admin หรือ BOOTSTRAP_TOKEN)
- [x] 7.6 controller + Swagger docs (multipart, response report)
- [ ] 7.7 FE export เพิ่มคอลัมน์ วันเกิด/บัตร (แก้ปัญหารหัสผ่าน) — แยกทำฝั่ง FE
- [ ] 7.8 ทดสอบ E2E: server ใหม่ (DB ว่าง) → ยิง 1 ครั้ง → login padmin + personnel login ได้
- [ ] 7.9 บันทึกใน checklist deploy (§10.5 เดิม)

---

## 8. Full-migration Export/Import (JSON dump) — เพิ่ม 2026-09-19

ย้ายข้อมูล server เก่า → ใหม่ **ครบทุก field ตามที่อยู่ใน DB** (แม่นกว่า CSV — ไม่มีปัญหา comma/multiline/emoji):

| Endpoint | Auth | หน้าที่ |
|---|---|---|
| `GET /api/bootstrap/export?token=<EXPORT_TOKEN>` | EXPORT_TOKEN (env) หรือ JWT super_admin | คืน JSON dump: `groups + rooms + roomImages + personnel(รวม password hash + isChangePassword) + userPayments + roomPayments` — **คง UUID เดิม** |
| `POST /api/bootstrap/import` (file = JSON dump) | BootstrapGuard เดิม | wipe ตารางที่เกี่ยว → insert ตามลำดับ FK → ensureSuperAdmin (idempotent) |

- รับทั้ง response ที่มี `data` wrapper และ raw dump
- `profileImage` = URL text เดิม (ไม่อัปโหลดรูปใหม่ — R2 ใช้ bucket เดียวกัน)
- dump ไม่รวม: notifications/announcements/survey2 answers (สร้างใหม่ต่อ server)
- ⚠️ env เพิ่ม: `EXPORT_TOKEN=<random>` — export มี PII + password hash ห้ามเปิดสาธารณะ

**ตัวอย่าง:**
```bash
# server เก่า: export
curl -o dump.json "https://<old>/api/bootstrap/export?token=$EXPORT_TOKEN"
# server ใหม่: import (Swagger หรือ curl)
curl -X POST "https://<new>/api/bootstrap/import" -H "x-bootstrap-token: $BOOTSTRAP_TOKEN" -F "file=@dump.json;type=application/json"
```

**E2E ผ่าน 2026-09-19:** export 251/9/60/2/0/1 → import → จำนวนครบ, 105105 login รหัสเดิมได้, profileImage/group/room ถูกต้อง, mustChangePassword คงสถานะเดิม

---

## 9. ตัวอย่างการใช้ (หลัง implement)

```
1. deploy BE ใหม่ + ตั้ง .env: BOOTSTRAP_TOKEN=xxx, BOOTSTRAP_ENABLED=true
2. เปิด Swagger (https://<host>/api/docs) → POST /bootstrap/import
3. Authorize ด้วย x-bootstrap-token (ปุ่ม Authorize ใน Swagger)
4. เลือกไฟล์ CSV (export จาก FE หรือ Google Forms) → Execute
5. อ่าน report: created/updated/warnings
6. login FE /admin/login → padmin / SuperSecret123 → เปลี่ยนรหัสทันที
7. ตั้ง BOOTSTRAP_ENABLED=false
```
