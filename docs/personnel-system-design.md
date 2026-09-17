# ระบบกำลังพล นทน.105 — System Design

> Design doc แยกต่างหาก ไม่กระทบ module อื่นในโปรเจ็ค
> ข้อมูลต้นทาง: `ฐานข้อมูล นทน. 105 ครับ (การตอบกลับ) - การตอบแบบฟอร์ม 1.csv` (Google Forms export, 28 คอลัมน์, 153 รายการที่กรอกจริง)

---

## สารบัญ

1. [วิเคราะห์ข้อมูล CSV ต้นทาง](#1-วิเคราะห์ข้อมูล-csv-ต้นทาง)
2. [ภาพรวมสถาปัตยกรรม](#2-ภาพรวมสถาปัตยกรรม)
3. [Entity Design](#3-entity-design)
4. [ระบบ Authentication & Initial Password](#4-ระบบ-authentication--initial-password)
5. [ระบบ Rights / Roles ของ Admin](#5-ระบบ-rights--roles-ของ-admin)
6. [CRUD API แต่ละ Module](#6-crud-api-แต่ละ-module)
7. [CSV Import Script](#7-csv-import-script)
8. [Frontend Design](#8-frontend-design)
9. [ข้อสังเกต / งานที่ต้องเก็บตก](#9-ข้อสังเกต--งานที่ต้องเก็บตก)
10. [Implementation Checklist (ทำทีละขั้น)](#10-implementation-checklist-ทำทีละขั้น)

---

## 1. วิเคราะห์ข้อมูล CSV ต้นทาง

### 1.1 โครงสร้างคอลัมน์ (28 คอลัมน์) → Field Mapping

| # | คอลัมน์ CSV | Field ปลายทาง | Type | หมายเหตุ |
|---|---|---|---|---|
| 1 | ประทับเวลา | — (ไม่เก็บ) | | metadata ของ form |
| 2 | หมายเลขประจำตัว | `username` | string, unique | เช่น `105105` |
| 3 | พวก (Group) | `group` → FK `group_id` | int 1–9 | ใช้เป็นเงื่อนไขสร้างตาราง `group` |
| 4 | ชั้นยศ | `rank` | text | สกปรก — ดู 1.2 |
| 5 | ชื่อ | `first_name` | string | |
| 6 | นามสกุล | `last_name` | string | |
| 7 | ชื่อเล่น | `nick_name` | string, nullable | |
| 8 | หมายเลขโทรศัพท์ | `phone` | string | |
| 9 | E-mail | `email` | string | อาจซ้ำ/null ได้ |
| 10 | ID LINE | `line_id` | string, nullable | LINE ID สำหรับแอดเพื่อน (เช่น `killer_animal`) — ต่างจาก `line_user_id` ที่ได้จาก LINE server ตอน login |
| 11 | กำเนิด | `origin` | text | จปร. 80 / นนร. 23 / กองหนุน 17 / นป. 12 / พลเรือน 10 / นรต. 5 / ต่างประเทศ 4 |
| 12 | รุ่นเตรียมทหาร | `pre_cadet_class` | string | เก็บเป็น string เพราะมี `NDUM Cadet Class 2007`, `Indonesian military academy 2012` |
| 13 | จำพวก (Type) | `type` + `is_special_forces` | enum + bool | สกปรก — ดู 1.2 |
| 14 | เหล่า | `branch_of_service` | text (ขั้นต้น) | 49 ค่า unique, มี typo เยอะ — ภายหลังค่อยทำ enum |
| 15 | สังกัดเดิม | `unit_before_course` | text, nullable | |
| 16 | หมายเลขห้องพัก | `room` → FK `room_id` | string | `0`/`000` = ไม่มีห้องพัก (29 รายการ) → `null` |
| 17 | ที่อยู่ปัจจุบัน | `address` | text | |
| 18 | เลขบัตรประชาชน | `citizen_id` | string(13), **unique** | ใช้ gen password + เก็บเป็น record |
| 19 | เลขบัตรประจำตัวทหาร/ตำรวจ | `military_id` | string, **unique**, nullable | |
| 20 | สถานะสมรส | `marital_status` | text | 5 ค่า |
| 21 | น้ำหนัก | `weight` | numeric, nullable | |
| 22 | ส่วนสูง | `height` | numeric, nullable | |
| 23 | หมู่โลหิต | `blood_type` | text | O 65 / B 50 / A 28 / AB 10 |
| 24 | โรคประจำตัว | `medical_conditions` | text | |
| 25 | วัน เดือน ปี เกิด | `date_of_birth` | date | format `D/M/YYYY` (เช่น `8/1/1992`) |
| 26 | หมายเหตุ | `remark` | text, nullable | |
| 27 | ข้อมูลเลขทะเบียนรถ | `vehicle_registration` | text, nullable | |
| 28 | ภูมิลำเนา (จังหวัด) | `home_province` | text, nullable | 54 ค่า, มี `มิตรประเทศ` ปน |

### 1.2 Data Quality Issues (สำคัญ ต้อง normalize ตอน import)

**`จำพวก (Type)` — 9 ค่า unique → ต้อง map เข้า enum 5 ค่า:**

| ค่าใน CSV | จำนวน | Map ไป |
|---|---|---|
| `ทบ.` | 122 | `ทบ.` |
| `สป.` | 10 | `ทบ.` — สป. = สำนักงานปลัดกระทรวงกลาโหม/ส่วนกลางกลาโหม (สป.กลาโหม, กรมการสรรพกำลังกลาโหม, กรมเสมียนตรา, กรมพระธรรมนูญ) — enum ไม่มีค่า สป. จึง default ทบ. + เก็บค่าดิบ แก้ไขเป็นรายคนได้ |
| `ทบ., นักบิน` | 4 | `ทบ.` (นักบิน ทบ.) |
| `นักบิน` | 3 | `ทบ.` — สังกัด กองพันบินที่ 1/2/3 กรมบิน, ศูนย์การบินทหารบก = หน่วยบินทหารบกทั้งหมด (ไม่ใช่ ทอ.) |
| `บก.ทท.` | 4 | `ทบ.` — ทท. = กองทัพไทย ไม่ใช่ ทอ.: สังกัด หน่วยบัญชาการไซเบอร์ทหาร, สำนักกองบัญชาการ/กองพันระวังป้องกัน กองบัญชาการกองทัพไทย, หน่วยบัญชาการทหารพัฒนา — หน่วยผสม (joint) กำเนิดส่วนใหญ่ จปร. จึง default ทบ. |
| `มิตรเหล่า(ทอ./ทร./ตร.)` | 4 | รายคน (infer อัตโนมัติด้วย `inferType()` §7.1): 105231 → `ทอ.` (กองบิน 46 กองทัพอากาศ, นนอ.) · 105226 → `ทร.` (กองพลนาวิกโยธิน กองทัพเรือ, นนร.) · 105235 → `ตร.` (บช.ตชด.) · 105238 → `ตร.` (ตำรวจภูธรภาค 4) |
| `มิตรประเทศ` | 4 | `มิตรประเทศ` (country = มาเลเซีย/อินโดนีเซีย/ลาว/สหรัฐฯ) |
| `ฉก.ทม.รอ.` | 1 | `ทบ.` + `is_special_forces = true` — เหล่าทหารม้า, สังกัด กรมทหารม้าที่ 4 รักษาพระองค์ (เลข 105177) |
| `ทบ., ฉก.ทม.รอ.` | 1 | ผู้กรอกติ๊กคร่อม 2 ช่อง (ฟอร์มมีจริงแค่ `ทบ.` หรือ `ฉก.ทม.รอ.`) — normalize ก่อน map: ค่าใดมี `ฉก.` อยู่ในข้อความ → ใช้ case `ฉก.ทม.รอ.` → `ทบ.` + `is_special_forces = true` (เลข 105210) |

> **หมายเหตุ ฉก.**: ฉก. ไม่ใช่จำพวก (type) — เป็นหน่วยที่อยู่ใต้ ทบ./ทร./ทอ. ได้ จึงเก็บเป็น field แยก `is_special_forces` ไม่กระทบ enum จำพวก ตัวอย่าง: type `ทบ.` + isSpecialForces `true`

> เพื่อความปลอดภัยของข้อมูล: เก็บค่าดิบไว้ในคอลัมน์ `source_type_raw` ด้วย เผื่อตรวจสอบย้อนหลัง

**อนุพันธ์ `เป็น ฉก. ใช่หรือไม่`:** แถวที่มีคำว่า `ฉก.` ปนในคอลัมน์จำพวก (`ฉก.ทม.รอ.` 1 รายการ, `ทบ., ฉก.ทม.รอ.` 1 รายการ) → `is_special_forces = true` ทั้งสองรายการ ที่เหลือ `false`

**`ชั้นยศ` — typo ต้อง normalize:** `พ.ต` / `พันตรี` / `Major` → `พ.ต.` (124 รายการคือ พ.ต. อยู่แล้ว), `พ.ต.ท.` → น่าจะ `พ.ท.` ⚠️ ยืนยัน

**`เหล่า` — 49 ค่า เช่น** `เหล่าทหารม้าาาา` (typo), `เหล่สทหารสารบรรณ` (typo), `ทหารราบ` vs `เหล่าทหารราบ` vs `เหล่าทหาราบ` (ค่าเดียวกันเขียนต่างกัน) → **import ตัดคำนำหน้า `เหล่าทหาร`/`เหล่า`/`ทหาร` ออกให้เหลือแค่ชื่อเหล่า** (`ราบ`, `ม้า`, `ปืนใหญ่`, `ช่าง`, ...) ด้วย `normalizeBranch()` §7.2 พร้อมแก้ typo ก่อนตัด — เก็บเป็น **text ขั้นต้น** ตาม requirement แล้วทำ enum + dropdown ทีหลัง

**`ห้องพัก`:** พบเฉพาะ 2xx–6xx, ค่า `0`/`000` (29 รายการ) = ไม่มีห้องพัก → import เป็น `room_id = null`

**`รุ่นเตรียมทหาร`:** `-` (43 รายการ คือ กองหนุน/พลเรือน/มิตรประเทศ) → `null`

**`เลขบัตรประชาชน`:** มีบางแถวที่กรอกไม่ครบ 13 หลัก → import ต้อง validate + รายงาน error

---

## 2. ภาพรวมสถาปัตยกรรม

### 2.1 Modules ใหม่ (แยกจาก module เดิมของโปรเจ็ค)

```
src/modules/
├── personnel/              # ข้อมูลกำลังพล (user นทน.105)
│   ├── personnel.module.ts
│   ├── personnel.controller.ts
│   ├── personnel.service.ts
│   ├── personnel.entity.ts
│   └── dto/
├── personnel-group/        # พวก (1–9) one-to-many → personnel
├── room/                   # ห้องพัก 201–710 one-to-many → personnel
├── payment/                # รวม user-payment + room-payment
│   ├── user-payment.entity.ts
│   └── room-payment.entity.ts
└── (admin module มีอยู่แล้ว → ขยายเพิ่ม role/rights)
```

### 2.2 ERD

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│   group     │ 1───N │    personnel     │ N───1 │    room     │
│─────────────│       │──────────────────│       │─────────────│
│ id (uuid)   │       │ id (uuid)        │       │ id (uuid)   │
│ name        │       │ username (uniq)  │       │ room_number │
│ description │       │ password (hash)  │       │ floor       │
│ leader_id   │       │ is_change_pwd    │       │ capacity    │
└─────────────┘       │ is_special_forces│       │ note        │
                      │ citizen_id       │       └──────┬──────┘
                      │ type (enum)      │              │ 1
                      │ country          │       ┌──────┴──────────────┐
                      │ branch_of_service│       │  room_image (1:N)   │
                      │ rank, name ...   │       │─────────────────────│
                      │ group_id (FK) ───┼──┐    │ id (uuid)           │
                      │ room_id (FK) ────┼──┼────│ room_id (FK)        │
                      │ profile_image    │  │    │ image (R2 url)      │
                      └──────┬───────────┘  │    │ caption             │
                             │ 1            │    │ taken_at            │
                ┌────────────┴───────┐      │    │ uploaded_by (FK→admin)│
                │    user_payment    │      │    └─────────────────────┘
                │────────────────────│      │
                │ id (uuid)          │      │
                │ user_id (FK)       │      │
                │ title, amount      │      │
                │ payment_date       │      │
                │ slip_image (R2)    │      │
                │ status (enum)      │      │
                │ confirmed_by (FK→admin)  │
                │ confirmed_at       │      │
                └────────────────────┘      │
                                            │
                              ┌─────────────┴───────────┴──┐
                              │       room_payment        │
                              │────────────────────────────│
                              │ id (uuid)                  │
                              │ room_id (FK)               │
                              │ paid_by_user_id (FK→personnel)│
                              │ title, amount, period      │
                              │ payment_date               │
                              │ slip_image (R2)            │
                              │ status (enum)              │
                              │ confirmed_by (FK→admin)    │
                              │ confirmed_at               │
                              └────────────────────────────┘

┌──────────────────┐
│      admin       │
│──────────────────│
│ id (uuid)        │
│ username (uniq)  │
│ password (hash)  │
│ name, phone      │
│ role (enum)      │  super_admin | it | personnel | building | education
│ is_active        │
│ profile_image    │
└──────────────────┘
```

### 2.3 ธรรมเนียมที่ทำตามโปรเจ็คเดิม

- Entity สืบทอด `GlobalEntity` (`createdAt`, `updatedAt`, `isDeleted`)
- ตาราง: `${ENV}_personnel`, `${ENV}_room`, ฯลฯ (pattern เดิมของโปรเจ็ค)
- PK = uuid (`@PrimaryGeneratedColumn('uuid')`)
- Response ทุก endpoint ใช้ `ResponseModel<T>` (`data`, `meta`, `link`)
- Validation ผ่าน `class-validator` DTO + global `ValidationPipe`
- อัปโหลดรูป (slip, profile) ผ่าน R2 module เดิม

---

## 3. Entity Design

### 3.1 `Personnel` — ข้อมูลกำลังพล

```typescript
// src/modules/personnel/personnel.entity.ts
export enum PersonnelType {
  ARMY = 'ทบ.',
  NAVY = 'ทร.',
  AIR_FORCE = 'ทอ.',
  POLICE = 'ตร.',
  FOREIGN = 'มิตรประเทศ',
}

@Entity({ name: `${process.env.ENV}_personnel` })
export class Personnel extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;              // หมายเลขประจำตัว เช่น "105105" — ใช้ login (คู่กับ schoolEmail ได้)

  @Column({ select: false })     // ไม่ select ออกมาโดย default
  password: string;              // bcrypt hash

  @Column({ default: false })
  isChangePassword: boolean;     // false = ยังใช้ password ตั้งต้น ต้องบังคับเปลี่ยน

  @Column({ type: 'varchar', length: 13, unique: true, nullable: true })
  citizenId: string;             // 13 หลัก — ใช้ gen password ตั้งต้น (unique, NULL ได้หลายแถวใน Postgres)

  @Column({ type: 'date', nullable: true })
  dateOfBirth: string;           // YYYY-MM-DD — ใช้ gen password ตั้งต้น

  @Column({ type: 'enum', enum: PersonnelType })
  type: PersonnelType;           // ทบ./ทร./ทอ./ตร./มิตรประเทศ

  @Column({ default: 'ไทย' })
  country: string;               // ไม่ใช่มิตรประเทศ = "ไทย" ทั้งหมด

  @Column({ nullable: true })
  sourceTypeRaw: string;         // ค่าจำพวกดิบจาก CSV (ไว้ audit)

  @Column({ nullable: true })
  branchOfService: string;       // เหล่า — text ขั้นต้น (ราบ/ม้า/ปืนใหญ่/...) ภายหลังทำ enum

  @Column({ default: false })
  isSpecialForces: boolean;      // เป็น ฉก. ใช่หรือไม่ (derive จาก CSV: จำพวกมีคำว่า "ฉก.")

  @Column({ nullable: true })
  rank: string;                  // ชั้นยศ เช่น "พ.ต."

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  nickName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;                 // E-mail ส่วนตัวจากฟอร์ม

  @Column({ unique: true, nullable: true })
  schoolEmail: string;           // email ของโรงเรียน — ใช้เป็น login id แทนหมายเลขประจำตัวได้ (unique)

  @Column({ nullable: true })
  lineId: string;                // LINE ID สำหรับ "แอดเพื่อน" จากฟอร์ม (เช่น killer_animal) — ไม่ unique

  @Column({ unique: true, nullable: true })
  lineUserId: string;            // userId จาก LINE server (LINE Login) — ผูก LINE account เข้ากับ user นี้ (opaque UID เช่น U4af...)

  @Column({ nullable: true })
  origin: string;                // กำเนิด: จปร./นนร./นรต./กองหนุน/นป./พลเรือน

  @Column({ nullable: true })
  preCadetClass: string;         // รุ่นเตรียมทหาร (string เพราะมี "NDUM Cadet Class 2007")

  @Column({ nullable: true })
  unitBeforeCourse: string;      // สังกัดเดิมก่อนเข้าหลักสูตร

  @Column({ nullable: true })
  address: string;

  @Column({ unique: true, nullable: true })
  militaryId: string;            // เลขบัตรประจำตัวทหาร/ตำรวจ (unique)

  @Column({ nullable: true })
  maritalStatus: string;

  @Column({ type: 'numeric', nullable: true })
  weight: number;

  @Column({ type: 'numeric', nullable: true })
  height: number;

  @Column({ nullable: true })
  bloodType: string;

  @Column({ nullable: true })
  medicalConditions: string;

  @Column({ nullable: true })
  remark: string;

  @Column({ nullable: true })
  vehicleRegistration: string;

  @Column({ nullable: true })
  homeProvince: string;

  @Column({ nullable: true })
  profileImage: string;          // R2 URL

  @Column({ type: 'uuid', nullable: true })   // null = ยังไม่เข้าพวก / ไม่มีห้อง
  groupId: string;

  @Column({ type: 'uuid', nullable: true })   // null = ไม่มีห้องพัก (CSV: 0/000)
  roomId: string;

  @ManyToOne(() => PersonnelGroup, (g) => g.personnels)
  @JoinColumn({ name: 'group_id' })
  group: PersonnelGroup;

  @ManyToOne(() => Room, (r) => r.personnels)
  @JoinColumn({ name: 'room_id' })
  room: Room;
}
```

### 3.2 `PersonnelGroup` — พวก (one-to-many → personnel)

```typescript
// src/modules/personnel-group/personnel-group.entity.ts
@Entity({ name: `${process.env.ENV}_personnel_group` })
export class PersonnelGroup extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;                  // "1" ... "9"

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  leaderId: string;              // หัวหน้าพวก (FK → personnel) — optional

  @OneToMany(() => Personnel, (p) => p.group)
  personnels: Personnel[];
}
```

Seed: พวก 1–9 (จาก CSV มีครบ 1–9)

### 3.3 `Room` — ห้องพัก (one-to-many → personnel)

```typescript
// src/modules/room/room.entity.ts
@Entity({ name: `${process.env.ENV}_room` })
export class Room extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  roomNumber: string;            // "201" ... "710"

  @Column()
  floor: number;                 // 2–7 (derive จากหลักร้อย)

  @Column({ default: 2 })
  capacity: number;              // จุได้กี่คน

  @Column({ nullable: true })
  note: string;

  @OneToMany(() => Personnel, (p) => p.room)
  personnels: Personnel[];

  @OneToMany(() => RoomImage, (ri) => ri.room)
  roomImages: RoomImage[];       // สถานภาพห้องก่อนเข้าอยู่ — อัปโหลดโดยหน.อาคาร

  @OneToMany(() => RoomPayment, (rp) => rp.room)
  roomPayments: RoomPayment[];
}
```

Seed: ชั้น 2–7 × ห้องละ 10 = 201–210, 301–310, 401–410, 501–510, 601–610, 701–710 (60 ห้อง)

### 3.4 `RoomImage` — ภาพสถานภาพห้องก่อนเข้าอยู่ (one-to-many → room)

```typescript
// src/modules/room/room-image.entity.ts
@Entity({ name: `${process.env.ENV}_room_image` })
export class RoomImage extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  roomId: string;

  @ManyToOne(() => Room, (r) => r.roomImages)
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column()
  image: string;                  // R2 URL — ภาพสถานภาพห้องก่อนเข้าอยู่

  @Column({ nullable: true })
  caption: string;                // คำอธิบาย เช่น "ก่อนเข้าอยู่ ก.ย. 2026"

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  takenAt: Date;                  // วันที่บันทึกภาพ

  @Column({ type: 'uuid', nullable: true })
  uploadedBy: string;             // admin (หน.อาคาร) ที่อัปโหลด
}
```

> ใช้ตารางแยก (`[]RoomImage`) ไม่ใช่ JSON array column — เพราะต้อง filter/เรียงตามวันที่, ผูกกับ R2 lifecycle, และ soft-delete ต่อรูปได้

### 3.5 `Admin` + Rights (ขยายจาก module เดิม)

```typescript
// src/modules/admin/admin.entity.ts (เพิ่ม field)
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  IT = 'it',                     // แอดมิน IT
  PERSONNEL = 'personnel',       // แอดมินกำลังพล
  BUILDING = 'building',         // หน.อาคาร
  EDUCATION = 'education',       // แอดมินการศึกษา
}

@Entity({ name: `${process.env.ENV}_admin1` })  // ชื่อตารางเดิมของโปรเจ็ค
export class Admin extends GlobalEntity {
  // ...username, password, name, phone, profileImage (เดิม)

  @Column({ type: 'enum', enum: AdminRole, default: AdminRole.PERSONNEL })
  role: AdminRole;

  @Column({ default: true })
  isActive: boolean;
}
```

Rights enforcement: Guard + Decorator

```typescript
// src/common/decorators/admin-roles.decorator.ts
export const AdminRoles = (...roles: AdminRole[]) => SetMetadata('adminRoles', roles);

// src/common/guards/admin-roles.guard.ts
@Injectable()
export class AdminRolesGuard implements CanActivate {
  // อ่าน request.user.role เทียบกับ metadata 'adminRoles'
  // super_admin ผ่านทุก endpoint เสมอ
}

// ใช้งาน:
@UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
@AdminRoles(AdminRole.PERSONNEL)
@Patch(':id')
update(...) {}
```

### 3.6 `UserPayment` — ประวัติการเก็บเงินรายบุคคล (เงินรุ่น)

```typescript
// src/modules/payment/user-payment.entity.ts
export enum PaymentStatus {
  PENDING = 'pending',       // รอแอดมินตรวจสอบ
  APPROVED = 'approved',     // แอดมินยืนยันแล้ว
  REJECTED = 'rejected',     // ไม่ผ่าน (สลิปไม่ตรง ฯลฯ)
}

@Entity({ name: `${process.env.ENV}_user_payment` })
export class UserPayment extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;                // เจ้าของการจ่าย

  @ManyToOne(() => Personnel, (p) => p.payments)
  @JoinColumn({ name: 'user_id' })
  user: Personnel;

  @Column()
  title: string;                 // เช่น "ค่าเลี้ยงสังสรรค์รุ่น", "ค่าสมทบงานศพ"

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  paymentDate: string;           // วันที่จ่าย

  @Column({ nullable: true })
  slipImage: string;             // R2 URL ของสลิป

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'uuid', nullable: true })
  confirmedBy: string;           // admin ที่ยืนยัน

  @Column({ type: 'timestamptz', nullable: true })
  confirmedAt: Date;

  @Column({ nullable: true })
  remark: string;                // เหตุผลกรณี rejected
}
```

### 3.7 `RoomPayment` — ประวัติการเก็บเงินรายห้อง (หน.อาคารดูแล)

```typescript
// src/modules/payment/room-payment.entity.ts
@Entity({ name: `${process.env.ENV}_room_payment` })
export class RoomPayment extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  roomId: string;                // ห้องที่เก็บ

  @ManyToOne(() => Room, (r) => r.roomPayments)
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({ type: 'uuid', nullable: true })
  paidByUserId: string;          // ผู้จ่าย (คนในห้อง) — nullable เผื่อค่าใช้จ่ายห้องไม่ผูกคน

  @ManyToOne(() => Personnel, { nullable: true })
  @JoinColumn({ name: 'paid_by_user_id' })
  paidBy: Personnel;

  @Column()
  title: string;                 // เช่น "ค่าส่งน้ำห้อง 405", "ค่าไฟเดือน ก.ย."

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  period: string;                // "2026-09" — สำหรับค่าใช้จ่ายรายเดือน

  @Column({ type: 'date' })
  paymentDate: string;

  @Column({ nullable: true })
  slipImage: string;             // R2 URL ของสลิป

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'uuid', nullable: true })
  confirmedBy: string;           // หน.อาคารที่ยืนยัน

  @Column({ type: 'timestamptz', nullable: true })
  confirmedAt: Date;

  @Column({ nullable: true })
  remark: string;
}
```

---

## 4. ระบบ Authentication & Initial Password

### 4.1 กฎการสร้าง Password ตั้งต้น

```
plain password ตั้งต้น = {DDMMYYYY ของวันเกิด}{เลขบัตรประชาชน 13 หลัก}
เช่น เกิด 8/1/1992, บัตร 1509901114792 → "080119921509901114792" (21 ตัว)
เก็บเป็น bcrypt hash (cost ≥ 10) ใน `password`
`isChangePassword` = false
```

> **การเก็บวันเกิด (2026-09-16):** `dateOfBirth` เป็น `timestamptz` เก็บ **เวลา 12:00 Asia/Bangkok** (`toNoonBangkokDate()` / import script เหมือนกัน) — กัน timezone shift ทำวันเดือนปีเพี้ยนตอน FE แปลง `genInitialPassword()` อ่านค่าด้วย `Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok' })` ได้ DDMMYYYY เสมอ

> **เบอร์โทรศัพท์ (2026-09-16):** เลข 0 นำหน้าหายเมื่อเปิด/บันทึก CSV ใน Excel (numeric coercion) — import ใช้ `normalizePhone()` กันซ้ำ (9 หลักไม่มี 0 → เติม 0) และเมื่อทำ export §6.1 ต้องเขียนเบอร์เป็น text (quote/tab) เสมอ

> แนะนำเพิ่ม: gen ครั้งเดียวตอน import — ไม่ควรมี API ที่คืน plain password กลับมา. ถ้าลืมรหัส ใช้ flow "รีเซ็ตกลับเป็น password ตั้งต้น + isChangePassword=false" แทน

### 4.2 Login Flow (บังคับเปลี่ยนรหัสครั้งแรก)

```
POST /api/auth/personnel/sign-in
  { "username": "105105", "password": "080119921509901114792" }

`username` ยอมรับได้ 2 แบบ: หมายเลขประจำตัว ("105105") หรือ schoolEmail —
query: WHERE username = :input OR schoolEmail = :input

ตรวจรหัส + bcrypt.compare
├── ไม่ผ่าน → 401
└── ผ่าน → ออก JWT (strategy `userJwt` เดิม / หรือ `personnelJwt` แยกใหม่)
          └── ถ้า isChangePassword === false
              → response มี flag mustChangePassword: true
              → frontend พาไปหน้าเปลี่ยนรหัส และ block การใช้งานส่วนอื่น

POST /api/personnel/change-password   (guard: personnel JWT)
  { "oldPassword": "...", "newPassword": "...", "confirmPassword": "..." }
  → validate ความซับซ้อน (≥ 8 ตัว, มีตัวเลข)
  → bcrypt hash ใหม่, isChangePassword = true
```

Middleware/Guard เสริม (แนะนำ): `PersonnelPasswordChangedGuard` — ทุก endpoint อื่นของ personnel ถ้า `isChangePassword === false` ตอบ `403 MUST_CHANGE_PASSWORD` ไปเลย กัน bypass ที่ API level ไม่ต้องพึ่ง frontend

---

## 5. ระบบ Rights / Roles ของ Admin

### 5.1 Rights Matrix

| ฟีเจอร์ | super_admin | it | personnel (กำลังพล) | building (หน.อาคาร) | education (การศึกษา) |
|---|:---:|:---:|:---:|:---:|:---:|
| จัดการ admin (CRUD + มอง role) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Personnel CRUD | ✅ | ❌ | ✅ | ❌ | view only |
| Group CRUD + จัดพวก | ✅ | ❌ | ✅ | ❌ | view only |
| Room CRUD + จัดห้อง | ✅ | ❌ | ✅ | ✅ | view only |
| Room image อัปโหลด/ลบ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Import CSV กำลังพล | ✅ | ✅ | ✅ | ❌ | ❌ |
| User payment ยืนยัน | ✅ | ❌ | ✅ | ❌ | ❌ |
| Room payment ดู/ยืนยัน | ✅ | ❌ | ❌ | ✅ | ❌ |
| รายงาน/สรุป (summary) | ✅ | ✅ | ✅ | ✅ | ✅ |

หมายเหตุ:
- `super_admin` ผ่านทุกอย่างเสมอ (hardcode ใน `AdminRolesGuard`)
- `it` = ดูแลระบบ/บัญชีแอดมิน แต่ไม่แตะข้อมูลกำลังพลเชิงธุรกิจ
- ผู้ใช้ (personnel) ยืนยันตัวด้วย JWT ตัวเอง — แยก strategy จาก admin ตาม pattern เดิมของโปรเจ็ค (`userJwt` / `adminJwt`)

### 5.2 Seed Admin ตั้งต้น

```
super_admin / (เปลี่ยนตอน deploy ครั้งแรก)
```

---

## 6. CRUD API แต่ละ Module

ทุก route อยู่ใต้ `/api` · Response = `ResponseModel<T>` · Pagination ใช้ `?page=1&limit=20` (คืน `meta.total` + `link.prev/next` ตาม pattern โปรเจ็ค)

### 6.1 Personnel Module — `/api/personnel`

| Method | Path | Guard | คำอธิบาย |
|---|---|---|---|
| `GET` | `/personnel` | adminJwt (personnel\|it\|building\|education view) | รายการทั้งหมด + filter `?groupId=&roomId=&type=&search=&page=&limit=` |
| `GET` | `/personnel/:id` | adminJwt | ดูรายคน |
| `GET` | `/personnel/me` | personnelJwt | ดู profile ตัวเอง |
| `PATCH` | `/personnel/me` | personnelJwt | แก้ข้อมูลตัวเอง (field จำกัด: phone, email, lineId, address, profileImage) |
| `POST` | `/personnel` | adminJwt + role personnel | สร้างรายใหม่ (server gen password ตั้งต้นจาก DOB+citizenId) |
| `PATCH` | `/personnel/:id` | adminJwt + role personnel | แก้ข้อมูล (รวมจัด group/room) |
| `DELETE` | `/personnel/:id` | adminJwt + role personnel | soft delete (`isDeleted = true`) |
| `POST` | `/personnel/:id/reset-password` | adminJwt + role personnel\|it | รีเซ็ตกลับ password ตั้งต้น + `isChangePassword=false` |
| `POST` | `/personnel/change-password` | personnelJwt | เปลี่ยนรหัสผ่านตัวเอง (ใช้ตอน force change) |
| `POST` | `/personnel/import` | adminJwt + role personnel\|it | upload CSV → bulk import (ดูหัวข้อ 7) |
| `GET` | `/personnel/export` | adminJwt + role personnel | export รายชื่อ (csv/xlsx) |

**ตัวอย่าง CreatePersonnelDto:**

```typescript
class CreatePersonnelDto {
  @IsString() @IsNotEmpty() username: string;      // หมายเลขประจำตัว
  @IsDateString() dateOfBirth: string;
  @IsString() @Length(13, 13) citizenId: string;
  @IsEnum(PersonnelType) type: PersonnelType;
  @IsOptional() @IsString() country?: string;       // default 'ไทย'
  @IsOptional() @IsString() branchOfService?: string;
  @IsString() rank: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
  // ... field ที่เหลือ optional
  @IsOptional() @IsUUID() groupId?: string;
  @IsOptional() @IsUUID() roomId?: string;
}
```

Service ต้อง: ตรวจ `username` ซ้ำ → gen plain `DDMMYYYY + citizenId` → `bcrypt.hash` → save พร้อม `isChangePassword=false`

### 6.2 Personnel Group Module — `/api/personnel-groups`

| Method | Path | Guard | คำอธิบาย |
|---|---|---|---|
| `GET` | `/personnel-groups` | adminJwt | รายการพวกทั้งหมด (+ จำนวนคนในแต่ละพวก) |
| `GET` | `/personnel-groups/:id` | adminJwt | รายละเอียด + รายชื่อคนในพวก |
| `POST` | `/personnel-groups` | adminJwt + role personnel | สร้างพวก |
| `PATCH` | `/personnel-groups/:id` | adminJwt + role personnel | แก้ชื่อ/หัวหน้าพวก |
| `DELETE` | `/personnel-groups/:id` | adminJwt + role personnel | ลบ (ได้เมื่อไม่มีคนอยู่ หรือย้ายคนออกก่อน) |

### 6.3 Room Module — `/api/rooms`

| Method | Path | Guard | คำอธิบาย |
|---|---|---|---|
| `GET` | `/rooms` | adminJwt | รายการห้องทั้งหมด + filter `?floor=&isEmpty=` |
| `GET` | `/rooms/:id` | adminJwt | รายละเอียดห้อง + ผู้พัก |
| `POST` | `/rooms` | adminJwt + role personnel\|building | เพิ่มห้อง |
| `POST` | `/rooms/seed` | adminJwt + role building | generate 201–710 ทีเดียว |
| `PATCH` | `/rooms/:id` | adminJwt + role personnel\|building | แก้ capacity/note |
| `DELETE` | `/rooms/:id` | adminJwt + role building | ลบ (ห้องต้องว่าง) |
| `GET` | `/rooms/:id/personnels` | adminJwt | รายชื่อผู้พักในห้อง |
| `POST` | `/rooms/:id/assign/:personnelId` | adminJwt + role personnel\|building | จัดคนเข้าห้อง (ตรวจ capacity) |
| `DELETE` | `/rooms/:id/assign/:personnelId` | adminJwt + role personnel\|building | ย้ายออกจากห้อง |
| `GET` | `/rooms/:id/images` | adminJwt (building\|personnel\|super) + personnelJwt ที่อยู่ห้องนั้น | ดูภาพสถานภาพห้องทั้งหมด (เรียงตาม takenAt) |
| `POST` | `/rooms/:id/images` | adminJwt + role building | อัปโหลดภาพสถานภาพก่อนเข้าอยู่: `image` (R2 URL), `caption?`, `takenAt?` — auto `uploadedBy` |
| `DELETE` | `/rooms/:id/images/:imageId` | adminJwt + role building | ลบภาพ (soft delete) |

### 6.4 Admin Module — `/api/admin` (ขยายจากเดิม)

| Method | Path | Guard | คำอธิบาย |
|---|---|---|---|
| `POST` | `/auth/admin/sign-in` | public | login แอดมิน (มีเดิม) |
| `GET` | `/admin` | adminJwt + role super_admin\|it | รายการแอดมิน |
| `GET` | `/admin/:id` | adminJwt + role super_admin\|it | รายละเอียด |
| `POST` | `/admin` | adminJwt + role super_admin\|it | สร้างแอดมิน + ระบุ `role` |
| `PATCH` | `/admin/:id` | adminJwt + role super_admin\|it | แก้ข้อมูล/เปลี่ยน role/toggle isActive |
| `DELETE` | `/admin/:id` | adminJwt + role super_admin | ลบแอดมิน (กันลบตัวเอง + กันลบ super_admin ตัวสุดท้าย) |
| `GET` | `/admin/roles` | adminJwt | ดูรายการ role ทั้งหมด (สำหรับ dropdown) |

### 6.5 User Payment Module — `/api/user-payments` (เงินรุ่นรายบุคคล)

| Method | Path | Guard | คำอธิบาย |
|---|---|---|---|
| `GET` | `/user-payments` | adminJwt + role personnel\|super | ทั้งหมด + filter `?userId=&status=&from=&to=` |
| `GET` | `/user-payments/my` | personnelJwt | ประวัติการจ่ายของตัวเอง |
| `GET` | `/user-payments/:id` | adminJwt (personnel) เจ้าของ | รายละเอียด |
| `POST` | `/user-payments` | personnelJwt | แจ้งชำระ: title, amount, paymentDate, slipImage |
| `PATCH` | `/user-payments/:id` | personnelJwt (เจ้าของ, ถ้า status=pending) | แก้ไขรายการที่ยังไม่ยืนยัน |
| `DELETE` | `/user-payments/:id` | personnelJwt (เจ้าของ, pending) เจ้าของ / admin | ลบรายการ |
| `POST` | `/user-payments/:id/confirm` | adminJwt + role personnel | ยืนยัน → status=approved, confirmedBy, confirmedAt |
| `POST` | `/user-payments/:id/reject` | adminJwt + role personnel | ปฏิเสธ + reason |
| `GET` | `/user-payments/summary` | adminJwt + role personnel | สรุปยอดรวม/จำนวนคนจ่าย/ค้างชำระ ตามช่วงวันที่ |

Flow: ผู้ใช้อัปสลิปผ่าน R2 (`POST /r2/...` เดิม ได้ URL) → สร้าง user-payment (pending) → แอดมินกำลังพล confirm/reject

### 6.6 Room Payment Module — `/api/room-payments` (เงินรายห้อง, หน.อาคาร)

| Method | Path | Guard | คำอธิบาย |
|---|---|---|---|
| `GET` | `/room-payments` | adminJwt + role building\|super | ทั้งหมด + filter `?roomId=&status=&period=&from=&to=` |
| `GET` | `/room-payments/room/:roomId` | adminJwt + role building\|super | ประวัติเงินของห้องนั้น |
| `GET` | `/room-payments/my-room` | personnelJwt | ประวัติเงินห้องตัวเอง (ดูได้, แก้ไม่ได้) |
| `GET` | `/room-payments/:id` | adminJwt + role building | รายละเอียด |
| `POST` | `/room-payments` | adminJwt + role building\|personnel | บันทึกรายรับของห้อง (title, amount, roomId, paidByUserId?, period, slipImage?) |
| `PATCH` | `/room-payments/:id` | adminJwt + role building | แก้ไข (ถ้า pending) |
| `DELETE` | `/room-payments/:id` | adminJwt + role building | ลบ |
| `POST` | `/room-payments/:id/confirm` | adminJwt + role building | ยืนยันสลิป/ยอด |
| `POST` | `/room-payments/:id/reject` | adminJwt + role building | ปฏิเสธ + reason |
| `GET` | `/room-payments/summary` | adminJwt + role building | สรุปรายห้อง: ยอดเก็บได้/ค้าง, แยกตาม period |

---

## 7. CSV Import Script

Script แยกเป็น npm script: `npm run import:personnel -- <path-to-csv>`

### 7.1 อัลกอริทึม

```
1. อ่าน CSV (encoding utf-8, ข้ามแถวว่าง)
2. Parse วันเกิด: "8/1/1992" (D/M/YYYY) → ISO "1992-01-08"
3. Normalize:
   - type: map ตามตาราง 1.2 (เก็บค่าดิบใส่ sourceTypeRaw); map ไม่ตรง (เช่น มิตรเหล่า) → inferType() วิเคราะห์จากเหล่า + สังกัดเดิม
   - isSpecialForces: จำพวกดิบมี "ฉก." → true
   - branchOfService: ตัดคำนำหน้า "เหล่าทหาร"/"เหล่า"/"ทหาร" + แก้ typo → เหลือชื่อเหล่า ("ราบ", "ม้า", ...)
   - rank: map typo → มาตรฐาน
   - room: "0"/"000"/"" → null; อื่นๆ → หา room จาก roomNumber (seed ก่อน)
   - group: สร้าง/หา PersonnelGroup ชื่อตรงตัว
   - country: type = มิตรประเทศ → ดูจาก กำเนิด (มาเลเซีย/อินโดนีเซีย/ลาว/สหรัฐฯ), อื่นๆ → "ไทย"
4. Validate ต่อแถว:
   - username / citizenId / militaryId / schoolEmail ไม่ซ้ำ (ใน CSV และใน DB — ทั้ง 4 field เป็น unique)
   - citizenId ครบ 13 หลัก (ถ้าไม่ครบ → ยัง import ได้ แต่ gen password ไม่ได้ → ใส่ error report)
5. Gen password: plain = DDMMYYYY + citizenId → bcrypt.hash(plain, 10)
6. Upsert เป็นรายแถว (transaction ต่อแถว — ต่อ row ล้มไม่ด่าวทั้งชุด)
7. พิมพ์รายงาน: สำเร็จ N / ข้าม M (เหตุผล) / error K (รายละเอียดแถว)
```

### 7.2 Implementation

```typescript
// scripts/import-personnel.ts
// ใช้: npm run import:personnel -- <path-to-csv>
import * as fs from 'fs';
import * as csv from 'csv-parse';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Personnel, PersonnelType } from '../src/modules/personnel/personnel.entity';
import { PersonnelGroup } from '../src/modules/personnel-group/personnel-group.entity';
import { Room } from '../src/modules/room/room.entity';

// ---------- Mapping ----------

const TYPE_MAP: Record<string, PersonnelType> = {
  'ทบ.': PersonnelType.ARMY,
  'ทร.': PersonnelType.NAVY,           // ไม่ปรากฏใน CSV — ใส่ไว้เผื่อแก้ไขภายหลัง
  'ทอ.': PersonnelType.AIR_FORCE,      // ไม่ปรากฏใน CSV — ใส่ไว้เผื่อแก้ไขภายหลัง
  'ตร.': PersonnelType.POLICE,         // ไม่ปรากฏใน CSV — ใส่ไว้เผื่อแก้ไขภายหลัง
  'สป.': PersonnelType.ARMY,           // ส่วนกลางกลาโหม — enum ไม่มี สป. → default ทบ.
  'ทบ., นักบิน': PersonnelType.ARMY,   // กองพันบิน กรมบิน ทบ.
  'นักบิน': PersonnelType.ARMY,        // กรมบิน/ศูนย์การบินทหารบก = ทบ. (ไม่ใช่ ทอ.)
  'บก.ทท.': PersonnelType.ARMY,        // กองบัญชาการกองทัพไทย (joint) — ไม่ใช่ ทอ.
  'มิตรประเทศ': PersonnelType.FOREIGN,
  'ฉก.ทม.รอ.': PersonnelType.ARMY,     // เหล่าม้า สังกัดรักษาพระองค์ → ทบ.
};

// มิตรเหล่า(ทอ./ทร./ตร.) + กรณีอื่นที่ map ไม่ตรง → infer จากเหล่า + สังกัดเดิม
function inferType(branch: string, unit: string): PersonnelType {
  const s = `${branch} ${unit}`;
  if (/กองทัพเรือ|นาวิกโยธิน|กองเรือ|กรมทหารเรือ/.test(s)) return PersonnelType.NAVY;
  if (/กองทัพอากาศ|กองบิน(?!ที่)|นักบินกองทัพอากาศ/.test(s)) return PersonnelType.AIR_FORCE;
  if (/ตำรวจ|บช\.|ภูธร|ตชด\./.test(s)) return PersonnelType.POLICE;
  return PersonnelType.ARMY; // default: ทบ. (รวม กรมบิน/ศูนย์การบินทหารบก/ส่วนกลางกลาโหม/กอ.ทท.)
}

const FOREIGN_COUNTRIES = ['มาเลเซีย', 'อินโดนีเซีย', 'ลาว', 'สหรัฐอเมริกา', 'สหรัฐฯ'];

function resolveCountry(type: PersonnelType, origin: string): string {
  if (type !== PersonnelType.FOREIGN) return 'ไทย';
  const found = FOREIGN_COUNTRIES.find((c) => origin.includes(c.replace('สหรัฐฯ', 'สหรัฐ')));
  return found ?? origin; // กำเนิดเก็บค่าประเทศไว้ให้แล้ว
}

// ---------- Helpers ----------

function genInitialPassword(dob: string, citizenId: string): string {
  // dob format จาก CSV: "8/1/1992" (D/M/YYYY)
  const [d, m, y] = dob.split('/').map((x) => x.trim().padStart(2, '0'));
  return `${d}${m}${y}${citizenId}`; // DDMMYYYY + เลขบัตร 13 หลัก
}

function parseDob(dob: string): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(dob.trim());
  if (!m) return null;
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`; // → ISO date
}

const RANK_MAP: Record<string, string> = {
  'พ.ต': 'พ.ต.', 'พันตรี': 'พ.ต.', Major: 'พ.ต.',
  'พ.ต.ท.': 'พ.ท.', // ⚠️ ตำรวจ: พ.ต.ท. = พลตำรวจตรี — ทบ.คือ พ.ท. ดูรายคน
};

function normalizeRank(rank: string): string {
  return RANK_MAP[rank.trim()] ?? rank.trim();
}

// ตัดคำนำหน้าเหล่าออก: "เหล่าทหารราบ" → "ราบ", "เหล่าช่าง" → "ช่าง", "ทหารม้า" → "ม้า"
// พร้อมแก้ typo ก่อนตัด: "เหล่สทหารสารบรรณ" → "สารบรรณ", "เหล่าทหารม้าาาา" → "ม้า", "เหล่าทหาราบ" → "ราบ"
function normalizeBranch(raw: string): string {
  const b = raw
    .trim()
    .replace(/เหล่ส/g, 'เหล่า')        // typo: หล่ส → หล่า
    .replace(/ทหาราบ/g, 'ทหารราบ')    // typo สระหาย: ทหาราบ → ทหารราบ
    .replace(/(.)\1{2,}/g, '$1')       // พิมพ์ทับ: ม้าาาา → ม้า
    .replace(/เหล่าทหาร/g, '')         // ตัด "เหล่าทหาร" (ทุกตำแหน่ง — รองรับ "นาวิกโยธินเหล่าทหารราบ")
    .replace(/^เหล่า/, '')             // ตัด "เหล่า" นำหน้า ("เหล่าช่าง")
    .replace(/^ทหาร/, '')             // ตัด "ทหาร" นำหน้า ("ทหารราบ")
    .trim();
  return b || raw.trim();              // ตัดจนว่าง (กรอกแค่ "เหล่า") → คืนค่าเดิม
}

// ---------- Main ----------

interface ImportReport {
  success: number;
  skipped: { username: string; reason: string }[];
  errors: { username: string; error: string }[];
}

export async function importPersonnel(
  dataSource: DataSource,
  csvPath: string,
): Promise<ImportReport> {
  const personnelRepo = dataSource.getRepository(Personnel);
  const groupRepo = dataSource.getRepository(PersonnelGroup);
  const roomRepo = dataSource.getRepository(Room);
  const report: ImportReport = { success: 0, skipped: [], errors: [] };

  const content = fs.readFileSync(csvPath, 'utf-8'); // CSV จาก Google Forms เป็น utf-8
  const rows: string[][] = await new Promise((resolve, reject) =>
    csv.parse(content, { bom: true, trim: true }, (err, out) =>
      err ? reject(err) : resolve(out),
    ),
  );

  const [, ...dataRows] = rows; // แถวแรก = header

  // cache group/room เพื่อไม่ query ซ้ำทุกแถว
  const groups = new Map(
    (await groupRepo.find()).map((g) => [g.name, g.id]),
  );
  const rooms = new Map((await roomRepo.find()).map((r) => [r.roomNumber, r.id]));

  const seenUsernames = new Set<string>(
    (await personnelRepo.find({ select: { username: true } })).map((p) => p.username),
  );
  // unique fields: citizenId / militaryId / schoolEmail / lineId — เช็คซ้ำทั้งใน DB และในไฟล์
  const loadUnique = async (field: string) =>
    new Set(
      (await personnelRepo
        .createQueryBuilder('p')
        .select(`p.${field}`, 'v')
        .getRawMany()).map((r) => r.v),
    );
  const seenCitizenIds = await loadUnique('citizenId');
  const seenMilitaryIds = await loadUnique('militaryId');
  const seenSchoolEmails = await loadUnique('schoolEmail');

  for (const r of dataRows) {
    // ป้องกันแถวว่าง/สั้น
    if (r.length < 20 || !r[1]?.trim()) continue;
    const username = r[1].trim();

    try {
      if (seenUsernames.has(username)) {
        report.skipped.push({ username, reason: 'username ซ้ำ' });
        continue;
      }

      const militaryId = (r[18] ?? '').trim() || null;
      if (citizenId && seenCitizenIds.has(citizenId)) {
        report.skipped.push({ username, reason: `citizenId ซ้ำ: ${citizenId}` });
        continue;
      }
      if (militaryId && seenMilitaryIds.has(militaryId)) {
        report.skipped.push({ username, reason: `militaryId ซ้ำ: ${militaryId}` });
        continue;
      }

      const sourceTypeRaw = r[12] ?? '';
      const branch = r[13] ?? '';
      const unit = r[14] ?? '';
      const dobRaw = r[24] ?? '';
      const citizenId = (r[17] ?? '').replace(/\D/g, '');
      const dob = parseDob(dobRaw);

      // type: ค่าใดมี 'ฉก.' → ใช้ key 'ฉก.ทม.รอ.' (ค่าผสม = ติ๊กคร่อม, ฟอร์มมีแค่ ทบ. หรือ ฉก.ทม.รอ.)
      const typeKey = sourceTypeRaw.includes('ฉก.') ? 'ฉก.ทม.รอ.' : sourceTypeRaw;
      const type = TYPE_MAP[typeKey] ?? inferType(branch, unit);

      const isSpecialForces = sourceTypeRaw.includes('ฉก.');

      // room: 0/000/'' = ไม่มีห้องพัก
      const roomRaw = (r[15] ?? '').trim();
      const roomNumber = /^\d{3}$/.test(roomRaw) && !/^0+$/.test(roomRaw) ? roomRaw : null;

      // group: สร้างใหม่อัตโนมัติถ้ายังไม่มี (พวก 1–9)
      const groupName = (r[2] ?? '').trim();
      let groupId: string | null = null;
      if (groupName) {
        if (!groups.has(groupName)) {
          const g = await groupRepo.save(groupRepo.create({ name: groupName }));
          groups.set(groupName, g.id);
        }
        groupId = groups.get(groupName)!;
      }

      const personnel = personnelRepo.create({
        username,
        citizenId: citizenId.length === 13 ? citizenId : null,
        dateOfBirth: dob,
        type,
        country: resolveCountry(type, (r[10] ?? '').trim()),
        sourceTypeRaw,
        isSpecialForces,
        branchOfService: normalizeBranch(branch),
        rank: normalizeRank(r[3] ?? ''),
        firstName: (r[4] ?? '').trim(),
        lastName: (r[5] ?? '').trim(),
        nickName: r[6] || null,
        phone: r[7] || null,
        email: r[8] || null,
        lineId: r[9] || null,           // LINE ID แอดเพื่อน (CSV คอลัมน์ 10) — lineUserId ได้จาก LINE Login ตอนผูกบัญชี ไม่มีใน CSV
        origin: r[10] || null,
        preCadetClass: r[11] && r[11] !== '-' ? r[11] : null,
        unitBeforeCourse: unit || null,
        address: r[16] || null,
        militaryId: militaryId,
        maritalStatus: r[19] || null,
        weight: r[20] ? Number(r[20]) : null,
        height: r[21] ? Number(r[21]) : null,
        bloodType: r[22] || null,
        medicalConditions: r[23] || null,
        remark: r[25] || null,
        vehicleRegistration: r[26] || null,
        homeProvince: r[27] && r[27] !== 'มิตรประเทศ' ? r[27] : null,
        groupId,
        roomId: roomNumber ? rooms.get(roomNumber) ?? null : null,
        isChangePassword: false,
      });

      // gen password ตั้งต้นเมื่อข้อมูลครบ (DOB + บัตร 13 หลัก) — ถ้าไม่ครบ ยัง insert ได้ แต่ login ไม่ได้จนกว่าแอดมินจะแก้ข้อมูล
      if (dob && citizenId.length === 13) {
        personnel.password = await bcrypt.hash(
          genInitialPassword(dobRaw, citizenId),
          10,
        );
      } else {
        report.skipped.push({
          username,
          reason: 'ข้อมูลไม่ครบสำหรับ gen password (DOB หรือบัตรประชาชนไม่ครบ 13 หลัก)',
        });
      }

      await personnelRepo.save(personnel);
      seenUsernames.add(username);
      if (citizenId) seenCitizenIds.add(citizenId);
      if (militaryId) seenMilitaryIds.add(militaryId);
      report.success++;
    } catch (e) {
      report.errors.push({ username, error: (e as Error).message });
    }
  }

  console.log(`สำเร็จ: ${report.success} | ข้าม: ${report.skipped.length} | error: ${report.errors.length}`);
  report.skipped.forEach((s) => console.warn(`SKIP ${s.username}: ${s.reason}`));
  report.errors.forEach((s) => console.error(`ERROR ${s.username}: ${s.error}`));
  return report;
}
```

หมายเหตุ implementation:
- อ่าน CSV ด้วย `csv-parse` + `bom: true` (Google Forms export มี BOM)
- column index อ้างตาม header 28 คอลัมน์ใน §1.1 — ถ้าฟอร์มเพิ่ม/ลดคอลัมน์ต้องแก้ index (หรือพัฒนาต่อ: อ่าน header row แล้ว map ชื่อคอลัมน์ → index อัตโนมัติ)
- import ครั้งเดียวทีเดียว — รันซ้ำจะ skip ตาม username
- ต้อง seed rooms 201–710 ก่อนรัน import ไม่งั้น `roomId` จะเป็น null หมด

---

## 8. Frontend Design

> **โปรเจ็ค frontend**: `/Users/nazacity/Desktop/Project/cgsc105/pdx/cgsc105-personnel-fe`
> (scaffold จาก `legacy-nextjs-starter` — renamed + git init ใหม่แล้ว · backend = repo นี้ `1st-army-area-be`)

### 8.1 หลักการ

- **โปรเจ็คเดียว** ทั้ง admin และ user — แยกด้วย **URL prefix**: `/admin/*` = ฝั่งแอดมิน, `/` = ฝั่งผู้ใช้ (personnel)
- **Sidebar แยกกัน** 2 ตัว: `UserSidebar` (เมนูผู้ใช้) กับ `AdminSidebar` (เมนูแอดมิน filter ตาม role)
- Auth token แยกกันชัดเจน (user JWT ≠ admin JWT) → เก็บคนละ storage key, กันอยู่ 2 role พร้อมกันสับสน (อนุญาตให้เปิด admin กับ user คนละ tab ได้)

### 8.2 Tech Stack (ตาม reference project `2st-cavalry-division-information` — ตรงกับ scaffold ของ `cgsc105-personnel-fe` แทบทุก dependency)

| ส่วน | เทคโนโลยี | หมายเหตุ |
|---|---|---|
| Framework | **Next.js 16 (Pages Router)** + React 19 + TypeScript | โครง `src/pages`, `_app.tsx`, `_document.tsx` ตาม reference |
| UI Library | **MUI 7** (`@mui/material`, `@mui/icons-material`) + Emotion (ssr ผ่าน `@mui/material-nextjs` + `createEmotionCache`) | reference ใช้แบบเดียวกัน |
| State | **Redux Toolkit** + redux-persist (auth slice) | |
| Data fetching | **TanStack Query v5** + axios | service layer แยก folder `src/services/` |
| Form | react-hook-form + yup + @hookform/resolvers | |
| i18n | next-i18next (`src/translation/th`, `/en`) | ธรรมเนียมเดิมของโปรเจ็ค BE ก็มี th/en |
| Date | dayjs | |
| Alert | sweetalert2 | |
| โครง folder | `src/{pages,components,theme,store,services,models,dto,utils,constants,translation}` | copy pattern จาก reference |
| Layout components | `AdminLayout.tsx`, `Sidebar.tsx` (permanent Drawer 260px), `Topbar.tsx`, `FormLayout.tsx` | reference มีพร้อม — ดัดแปลงเป็น 2 sidebar |

### 8.3 ธีมสี — เขียวทหาร (dark)

ดึงจาก `studyplan/index.html` (CSS variables):

| Token | ค่า | ใช้เป็น |
|---|---|---|
| `--bg` | `#101410` | `palette.background.default` |
| `--card` | `#1c241c` | `palette.background.paper` |
| `--line` | `#2e3a2e` | `palette.divider` |
| `--txt` | `#e8ede6` | `palette.text.primary` |
| `--acc` | `#8fbf5f` | `palette.primary.main` (เขียวทหาร — ปุ่ม, link, active menu) |
| `--accdim` | `#3c5528` | `palette.primary.dark` (hover, selected bg) |
| `--gold` | `#d9b24c` | `palette.warning` (ยศ, ตรา, badge รางวัล) |
| `--blue` | `#7aa5c4` | `palette.info` |
| `--red` | `#e07856` | `palette.error` |
| `--done` | `#8fbf5f` | status สำเร็จ/อนุมัติ |

```typescript
// src/theme/colors.ts
export const COLORS = {
  bg: '#101410',
  card: '#1c241c',
  line: '#2e3a2e',
  txt: '#e8ede6',
  acc: '#8fbf5f',
  accdim: '#3c5528',
  gold: '#d9b24c',
  blue: '#7aa5c4',
  red: '#e07856',
};
```

ธีม dark ทั้งระบบ (admin + user ใช้ธีมเดียวกัน แยกกันแค่เมนู/route)

**โลโก้**: คัดลอก `/Users/nazacity/Desktop/study/เสธ/การเรียน/studyplan/assets/logo.png` → `public/logo.png` ของ frontend ใหม่ — ใช้ใน Topbar, หน้า login ทั้ง 2 ฝั่ง, favicon

### 8.4 Route Map

**ฝั่งผู้ใช้ (personnel) —  `/`**

| Path | หน้า | หมายเหตุ |
|---|---|---|
| `/login` | เข้าสู่ระบบ (หมายเลขประจำตัว + password) | |
| `/change-password` | เปลี่ยนรหัสผ่านครั้งแรก | บังคับถ้า `mustChangePassword` — block ทุกหน้าอื่น |
| `/` | Dashboard ผู้ใช้: ข้อมูลสรุปตัวเอง, พวก, ห้อง, แจ้งเตือนการเงิน | |
| `/profile` | ข้อมูลส่วนตัว (ดูได้, แก้ field จำกัด, อัปโหลด profile image) | |
| `/my-payments` | ประวัติเงินรุ่น + ฟอร์มแจ้งชำระ (อัปสลิป) | |
| `/my-room` | ข้อมูลห้อง + ผู้พักร่วม + ภาพสถานภาพห้อง + ประวัติเงินห้อง | |

`UserSidebar` เมนู: Dashboard, ข้อมูลส่วนตัว, เงินรุ่น, ห้องของฉัน

**ฝั่งแอดมิน — `/admin`**

| Path | หน้า | Role ที่เห็นเมนู |
|---|---|---|
| `/admin/login` | เข้าสู่ระบบแอดมิน | public |
| `/admin` | Dashboard: สถิติกำลังพล, ห้องว่าง/เต็ม, ยอดเงินค้างยืนยัน | ทุก role |
| `/admin/personnels` | ตารางกำลังพล + search/filter + CRUD + จัดพวก/ห้อง | personnel, super |
| `/admin/personnels/import` | อัปโหลด CSV + รายงานผล import | personnel, it, super |
| `/admin/groups` | จัดการพวก 1–9 | personnel, super |
| `/admin/rooms` | จัดการห้อง (แผนผังตามชั้น) + จัดผู้พัก | personnel, building, super |
| `/admin/rooms/[id]` | รายละเอียดห้อง + **อัปโหลดภาพสถานภาพก่อนเข้าอยู่** (gallery) | building, super (อัป), อื่นดูได้ |
| `/admin/user-payments` | ตรวจสลิปเงินรุ่น → ยืนยัน/ปฏิเสธ + สรุปยอด | personnel, super |
| `/admin/room-payments` | เงินรายห้อง → ยืนยัน + สรุปรายห้อง/รายเดือน | building, super |
| `/admin/admins` | จัดการแอดมิน + มอง role | super, it |

`AdminSidebar` กรองเมนูตาม `admin.role` เทียบ rights matrix (§5.1)

### 8.5 Layout & Guard โครงสร้าง

```
src/components/layout/
├── AdminLayout.tsx      # Topbar + AdminSidebar (permanent Drawer 260) — guard: admin token
├── UserLayout.tsx       # Topbar + UserSidebar — guard: personnel token
├── AdminSidebar.tsx     # เมนู filter ตาม role
├── UserSidebar.tsx
└── Topbar.tsx           # โลโก้ + ชื่อผู้ใช้ + logout (รับ props ฝั่งไหน)
```

- `_app.tsx`: อ่าน path — ขึ้นต้น `/admin` → AuthProvider แบบ admin, ไม่งั้นแบบ user
- Route guard ฝั่ง user: `mustChangePassword === true` → redirect ทุกหน้าไป `/change-password` (ยกเว้นหน้านั้นเอง)
- Route guard ฝั่ง admin: ตรวจ role กับสิทธิ์ของ path — ไม่มีสิทธิ์ → หน้า 403
- Service layer: `src/services/{auth,personnel,group,room,payment,admin}.service.ts` — axios instance ตั้ง baseURL `/api` + interceptor แนบ token ตามฝั่ง

### 8.6 หน้าเด่น (สเปคสั้น)

- **หน้าห้อง (`/admin/rooms/[id]`)**: การ์ดข้อมูลห้อง (ชั้น, capacity, ผู้พักปัจจุบัน) + tab 2 อัน — "ภาพสถานภาพ" (gallery + ปุ่มอัปโหลด MUI `Upload` → R2 → POST `/rooms/:id/images`, เฉพาะ role building) กับ "ประวัติเงินห้อง" (ตาราง + confirm)
- **ตรวจสลิป (`/admin/user-payments`)**: ตาราง status=pending ก่อน, คลิกดูสลิปเต็มจอ, ปุ่ม ยืนยัน/ปฏิเสธ (เหตุผล) — sweetalert2 confirm
- **Dashboard แอดมิน**: Card สถิติ (จำนวนกำลังพล, ห้องว่าง, สลิปรอยืนยัน, ยอดเงินห้องค้างชำระ) + กราฟยอดเงินรายเดือน
- **ตารางกำลังพล**: MUI DataGrid-style table, filter พวก/ห้อง/เหล่า/ฉก., export CSV

---

## 9. ข้อสังเกต / งานที่ต้องเก็บตก

1. **mapping `จำพวก` ตัดสินแล้วด้วยการวิเคราะห์เหล่า+สังกัดเดิม** (§1.2): สป./นักบิน/บก.ทท. → ทบ., มิตรเหล่า → inferType() รายคน (ทอ./ทร./ตร.) — เก็บ `source_type_raw` ไว้ทั้งหมด แอดมินแก้เป็นรายคนได้ภายหลัง
2. **`branch_of_service` cleanup** — 49 ค่า → ประมาณ 18 เหล่าจริง (ราบ ม้า ปืนใหญ่ ช่าง สื่อสาร สารบรรณ ขนส่ง พลาธิการ สรรพาวุธ การข่าว แผนที่ สารวัตร แพทย์ การสัตว์ พระธรรมนูญ นักบิน ตำรวจ อื่นๆ) — ทำ enum + dropdown รอบถัดไปตาม requirement
3. **บัตรประชาชนไม่ครบ 13 หลัก** — ตรวจนับจริงตอน import, แถวที่พังต้องมีช่องทางแอดมินแก้ภายหลัง (แก้แล้วระบบ gen password ตั้งต้นใหม่ได้)
4. **ความปลอดภัย password ตั้งต้น**: มาจากข้อมูลส่วนตัวที่ผู้ใช้รู้อยู่แล้ว → ต้องบังคับเปลี่ยนครั้งแรกเสมอ (มี guard กัน bypass) + พิจารณาบังคับ policy รหัสใหม่
5. **ห้อง 7xx ยังไม่มีคนใน CSV** — seed ไว้ก่อนได้เพราะ requirement ระบุ 201–710
6. **Room 0/000 (29 คน)** = ไม่มีห้องพัก (น่าจะกองหนุน/พลเรือน/มิตรประเทศ) — ยืนยันได้จากข้อมูล กำเนิด ช่วง import
7. **การลบ**: ใช้ soft delete (`isDeleted`) ตาม GlobalEntity — ประวัติ payment จึงไม่หาย
8. **สรุปยอด (summary)**: ออกแบบ endpoint สรุปไว้แล้ว (`/user-payments/summary`, `/room-payments/summary`) — ต่อยอด export PDF/Excel ได้ภายหลัง
9. **Frontend**: ใช้โปรเจ็คเดียวแยก route `/admin/*` กับ `/` (§8) — ต้องระวัง guard สองฝั่งไม่ชนกัน (token คนละ key)

---

## 10. Implementation Checklist (ทำทีละขั้น)

> ใช้ตอกย้ำความคืบหน้าเมื่อทำงานต่อหลาย session — ทำขั้นไหนเสร็จให้เปลี่ยน `[ ]` เป็น `[x]` พร้อมวันที่
> AI session ใหม่: อ่าน doc นี้ + หาขั้นแรกที่ยังไม่ tick แล้วทำต่อจากนั้นตาม Reference

### Stage 1 — Backend: Entities + Module Scaffold

- [x] 1.1 สร้าง `personnel` module (entity §3.1 + module/controller/service ว่าง) — รวม field `isSpecialForces` (2026-09-15)
- [x] 1.2 สร้าง `personnel-group` module (entity §3.2) + relation 1:N → personnel (2026-09-15)
- [x] 1.3 สร้าง `room` module (entity §3.3) + `room-image` entity (§3.4) relation 1:N → room (2026-09-15)
- [x] 1.4 ขยาย `admin` entity: `role` enum + `isActive` (§3.5) (2026-09-15)
- [x] 1.5 สร้าง `payment` module: `user-payment` (§3.6) + `room-payment` (§3.7) (2026-09-15)
- [x] 1.6 run `synchronize` ตรวจตารางครบใน DB (`dev_personnel`, `dev_personnel_group`, `dev_room`, `dev_room_image`, `dev_user_payment`, `dev_room_payment`) (2026-09-15)

Reference: §3.1–3.7 · ไฟล์: `src/modules/personnel/*`, `src/modules/personnel-group/*`, `src/modules/room/*`, `src/modules/payment/*`, `src/modules/admin/admin.entity.ts`

### Stage 2 — Backend: Auth + Rights

- [x] 2.1 `POST /api/auth/personnel/sign-in` (username+password, bcrypt) — คืน JWT + flag `mustChangePassword` (2026-09-15)
- [x] 2.2 `POST /api/personnel/change-password` + `isChangePassword=true` (2026-09-15)
- [x] 2.3 `PersonnelPasswordChangedGuard` บล็อกทุก endpoint ถ้ายังไม่เปลี่ยนรหัส (403 MUST_CHANGE_PASSWORD) (2026-09-15)
- [x] 2.4 `AdminRolesGuard` + `@AdminRoles()` decorator + ใส่ role ให้ seed super_admin (2026-09-15 — admin `admin` ใน dev DB ตั้ง role `super_admin` แล้ว)

Reference: §4.1–4.2, §5.1–5.2 · ไฟล์: `src/modules/auth/*`, `src/common/guards/*`, `src/common/decorators/*`

### Stage 3 — Backend: CRUD ทุก Module

- [x] 3.1 Personnel CRUD + `/me` + filter + reset-password (§6.1) (2026-09-15 — export/import เหลือทำ Stage 4)
- [x] 3.2 PersonnelGroup CRUD (§6.2) (2026-09-15)
- [x] 3.3 Room CRUD + seed 201–710 + assign/unassign + images endpoints (§6.3) (2026-09-15 — seed แล้ว 60 ห้องใน dev DB, เพิ่ม `GET /rooms/my` สำหรับ personnel)
- [x] 3.4 Admin CRUD + roles endpoint (§6.4) (2026-09-15 — CRUD มีเดิม, เพิ่ม `GET /admin/roles`)
- [x] 3.5 UserPayment CRUD + confirm/reject + summary (§6.5) (2026-09-15)
- [x] 3.6 RoomPayment CRUD + confirm/reject + summary (§6.6) (2026-09-15)
- [x] 3.7 smoke test ทุก endpoint ผ่าน Swagger `/api/docs` (2026-09-15 — ทดสอบผ่าน curl ครบ flow: sign-in บังคับเปลี่ยนรหัส, assign ห้อง, ภาพห้อง, ยืนยัน/ปฏิเสธสลิป, summary, role 403)

Reference: §6.1–6.6

### Stage 4 — Backend: CSV Import + Seed

- [x] 4.1 script `scripts/import-personnel.ts` ตามอัลกอริทึม §7.1 (normalize type/rank/room/isSpecialForces + gen password) (2026-09-16 — `npm run import:personnel -- <csv>`; enum ใช้ literal ไทยตรง entity; password คอลัมน์เป็น nullable แล้ว — แถวไม่ครบ import ได้แต่ login ไม่ได้)
- [x] 4.2 seed rooms 201–710 + groups 1–9 (2026-09-16 — ensureRooms/ensureGroups idempotent ใน script)
- [x] 4.3 รัน import จริง + ตรวจรายงาน error (บัตรไม่ครบ 13 หลัก, แถวที่ gen password ไม่ได้) (2026-09-16 — 146 สำเร็จ / 7 skip (กรอกฟอร์มซ้ำ) / 6 warn ไม่มี password: 105065, 105122, 105235, 105243, 105245, 105246 — ต้องแอดมินแก้ citizenId/DOB แล้ว reset-password)
- [x] 4.4 ทดสอบ login ด้วย password ตั้งต้น 1 รายการ (2026-09-16 — 105105 sign-in ผ่าน, mustChangePassword=true)

Reference: §7.1–7.2, §1.2

### Stage 5 — Frontend: Scaffold + Theme + Layout

- [x] 5.1 เริ่มจาก scaffold `cgsc105-personnel-fe` (`/Users/nazacity/Desktop/Project/cgsc105/pdx/cgsc105-personnel-fe` — stack ตรง §8.2 แล้ว) (2026-09-16)
- [x] 5.2 theme เขียวทหาร `src/theme/colors.ts` + `theme.ts` (§8.3) + คัดลอก logo → `public/logo.png` (2026-09-16 — palette `mode:'dark'` + token `COLORS.military` และ `COLORS.status`)
- [x] 5.3 `UserLayout` + `UserSidebar` + `AdminLayout` + `AdminSidebar` + `Topbar` (§8.5) (2026-09-16 — ใช้ `SidebarShell` ร่วม + `Topbar` รับ prop `side`, Drawer 260px)
- [x] 5.4 service layer (axios + interceptors 2 ฝั่ง) + auth slice (redux-persist) (2026-09-16 — `utils/userRequest`/`adminRequest` แนบ token จาก slice คนละอัน + 401 logout; slice `userAuth`/`adminAuth` persist whitelist)
- [x] 5.5 หน้า login 2 ฝั่ง + route guards (mustChangePassword, admin role) (2026-09-16 — `UserGuard` บังคับ `/change-password`, `AdminGuard` + `utils/permissions.ts` ตรวจ role ตาม §5.1 → 403; build ผ่าน + ทดสอบ render/CORS/API 201 — browser click-through เก็บ Stage 8)

Reference: §8.1–8.5

### Stage 6 — Frontend: ฝั่งผู้ใช้

- [x] 6.1 `/change-password` (บังคับครั้งแรก) (2026-09-16 — ทำตอน Stage 5.5 แล้ว)
- [x] 6.2 `/` dashboard ผู้ใช้ (2026-09-17 — การ์ดโปรไฟล์ + chip จำพวก/เหล่า/ฉก. + สถิติเงินรุ่น 4 การ์ด + รายการล่าสุด 5 รายการ)
- [x] 6.3 `/profile` ดู+แก้ field จำกัด + อัปโหลดรูป (2026-09-17 — ข้อมูลส่วนตัว read-only 16 field + ฟอร์มแก้ phone/email/lineId/address + อัปโหลดรูปผ่าน `POST /r2/profile-image` → `PATCH /personnel/me`)
- [x] 6.4 `/my-payments` ประวัติ + แจ้งชำระ + อัปสลิป (2026-09-17 — ตาราง + StatusChip + dialog แจ้งชำระ/แก้ไข (pending เท่านั้น) + อัปสลิป `POST /r2/image` + ลบด้วย sweetalert2 confirm)
- [x] 6.5 `/my-room` ข้อมูลห้อง + ภาพสถานภาพ + เงินห้อง (2026-09-17 — การ์ดห้อง+ผู้พัก, gallery ภาพ+lightbox, ตาราง `/room-payments/my-room`; ไม่มีห้อง → empty state; **แก้ `.env.development` baseURL เพิ่ม `/api`** — ก่อนหน้า FE ยิงพลาด prefix)
  - ทดสอบ API flow จริง (curl): sign-in 105105 รหัสตั้งต้น → บังคับเปลี่ยนรหัส → `/me` `/rooms/my` `/user-payments/my` → สร้าง payment → admin confirm → ลบ → reset-password กลับรหัสตั้งต้น — ผ่านทั้งหมด; FE build + render ทุกหน้าผ่าน (browser click-through เก็บ Stage 8)

Reference: §8.4 (ฝั่งผู้ใช้), §8.6

### Stage 7 — Frontend: ฝั่งแอดมิน

- [x] 7.1 `/admin` dashboard สถิติ (2026-09-17 — การ์ดกำลังพล/ห้องว่าง + summary เงินรุ่น/เงินห้อง กรองตาม role: เงินรุ่นเห็นเฉพาะ super/personnel, เงินห้องเห็น super/building)
- [x] 7.2 `/admin/personnels` ตาราง + filter + CRUD + จัดพวก/ห้อง (2026-09-17 — client-side filter พวก/ห้อง/จำพวก/ฉก./ค้นหา + pagination + dialog สร้าง/แก้ + reset-password + soft delete + export CSV (เบอร์โทรเขียนเป็น text กัน Excel กินเลข 0) — education เห็นแบบ read-only)
- [x] 7.3 `/admin/personnels/import` อัปโหลด CSV (2026-09-17 — **BE เพิ่ม `POST /personnel/import`** (multipart `file`, role personnel|it) โดยดึง logic จาก script มาเป็น `personnel-import.helper.ts` ใช้ร่วมกับ npm script; FE หน้าอัปโหลด + รายงานผล success/skip/warn/error แยกสี. หมายเหตุ: ไฟล์ CSV ปัจจุบันมี response เพิ่ม 68 แถวจากตอน import ครั้งแรก — รอบนี้เพิ่มอีก 56 คน (รวม 202 คน), ส่วน duplicate ข้ามอัตโนมัติ)
- [x] 7.4 `/admin/groups` (2026-09-17 — การ์ดพวก 1–9 + จำนวนสมาชิก + รายชื่อ + แก้ชื่อ/หัวหน้าพวก/ลบ (Swal confirm))
- [x] 7.5 `/admin/rooms` + `/admin/rooms/[id]` (gallery ภาพสถานภาพ + อัปโหลด — role building) (2026-09-17 — หน้า list: filter ชั้น + การ์ดห้องสีตามสถานะ (ว่าง/มีที่/เต็ม); หน้า detail: แก้ capacity/note + จัด/ย้ายผู้พัก + gallery + อัปโหลด/ลบภาพ (super/building) + ตารางเงินห้อง (building))
- [x] 7.6 `/admin/user-payments` ตรวจสลิป ยืนยัน/ปฏิเสธ (2026-09-17 — summary 4 การ์ด + filter สถานะ + ตาราง + ดูสลิป + ยืนยัน/ปฏิเสธ (Swal กรอกเหตุผล))
- [x] 7.7 `/admin/room-payments` ยืนยัน + สรุปรายห้อง (2026-09-17 — ตารางสรุปรายห้องจาก `/summary` + filter ห้อง/งวด/สถานะ + บันทึกรายรับ + ยืนยัน/ปฏิเสธ)
- [x] 7.8 `/admin/admins` (role super/it) (2026-09-17 — **BE ปรับ admin module ตาม §6.4**: AdminRolesGuard (super|it) แทน legacy units-check, DTO เพิ่ม `role`/`isActive`, กันลบตัวเอง (403) + กันลบ super_admin คนสุดท้าย, `profileImageUrl` เป็น nullable; FE ตาราง + dialog สร้าง/แก้ (role dropdown + toggle isActive) + ลบ)
- [x] 7.9 ตรวจ AdminSidebar กรองเมนูตาม role ครบทุก role (2026-09-17 — `canAccessPath` เพิ่ม education view-only (personnels/groups/rooms); ผล: super=8 เมนู, it=dashboard+import, personnel=7, building=dashboard/rooms/room-payments, education=dashboard+view 3 หน้า; ทดสอบ API 403 จริง: it→confirm-payment 403, building→delete-admin 403, delete-self 403)

Reference: §8.4 (ฝั่งแอดมิน), §5.1, §8.6

### Stage 8 — ทดสอบ + เก็บงาน

- [x] 8.1 E2E flow ผู้ใช้: login ครั้งแรก → เปลี่ยนรหัส → แจ้งชำระ → แอดมินยืนยัน (2026-09-17 — ผ่านครบทุกขั้น: login ตั้งต้น mustChange=true → 403 ก่อนเปลี่ยนรหัส → change-password 201 → /me 200 → แจ้งชำระ pending → admin confirm approved → เห็นใน my list → cleanup + reset กลับรหัสตั้งต้น)
- [x] 8.2 E2E ห้อง: หน.อาคารอัปโหลดภาพ → ผู้พักเห็นใน `/my-room` (2026-09-17 — R2 จริง: building admin `POST /r2/image` → `POST /rooms/:id/images` → personnel `GET /rooms/my` เห็นภาพ+caption → ลบภาพสำเร็จ)
- [ ] 8.3 ยืนยัน mapping type กำกวมกับเจ้าภาพข้อมูล (§1.2, §9) — **เตรียมรายการแล้วที่ `docs/mapping-confirmation.md`** (มิตรเหล่า 7 · สป. 15 · นักบิน 11 · บก.ทท. 7 · ฉก. 5 · พ.ท. 5 · ไม่มีรหัสผ่าน 13) — รอเจ้าภาพข้อมูลยืนยัน ⚠️ 105228 (มิตรเหล่า ราบ) infer เป็น ทบ. โดย default
- [x] 8.4 ทดสอบ rights: แต่ละ role เข้า path ที่ไม่มีสิทธิ์ → 403 (2026-09-17 — สร้าง admin 4 role (it/personnel/building/education) ยิงตาม matrix: GET /personnel + /personnel-groups ทุก role 200; POST /personnel เฉพาะ personnel; import personnel|it; /user-payments personnel; /room-payments + room images + assign building; /admin it — ผลตรง matrix ทั้งหมด แล้วลบ test admins)
- [x] 8.5 เตรียม deploy (Docker/CI ตาม pattern โปรเจ็ค) (2026-09-17 — Dockerfile + .gitlab-ci.yml + helm มีอยู่เดิมใช้ได้; ตรวจ `csv-parse`/`bcrypt` อยู่ใน runtime dependencies (สำคัญเพราะ import helper import จาก src แล้ว); `npm run build` ผ่าน; ไม่มี env var ใหม่)

Reference: §5.1, §9

