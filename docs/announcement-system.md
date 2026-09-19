# ANNOUNCEMENT SYSTEM — ประกาศหน้าหลักผู้ใช้

> สถานะ: **เสร็จ + E2E ผ่าน** — สร้าง 2026-09-19
> อ้างอิง entity: `legacy/fit/fit-api` → `Sys_Legacy_Nofication` (pin, title, description/sub_description text, thumbnail, link, link_type)
> ต่างจากระบบกระดิ่ง (`notification-system.md`): ประกาศ = ข่าวบนหน้าแรก **ไม่เลือกผู้รับ** (ทุกคนเห็นเท่ากัน) ไม่มีสถานะอ่าน

---

## 1. Entity `${ENV}_announcement` — map จาก legacy

| legacy (`Sys_Legacy_Nofication`) | ของเรา (`Announcement`) | หมายเหตุ |
|---|---|---|
| `pin: number` | `pin: number` (default 0) | ตัวเลขมาก = ขึ้นบนสุด (ปักหมุด) |
| `title` | `title` | |
| `description: text` | `description: text` | เนื้อหาหลัก — **text รองรับ emoji** แสดงเว้นบรรทัดได้ |
| `sub_description: text` | `sub_description: text` | รายละเอียดรอง (แสดงต่จาก description / อยู่ใน dialog ขยาย) |
| `thumbnail_img_url` | `thumbnailImgUrl` (nullable) | รูปประกอบ (R2) |
| `link` + `link_type: number` | `linkUrl` + `linkType: enum` | ปุ่ม "อ่านต่อ" |
| `notification_code` | ❌ ไม่ใช้ | โค้ดธุรกิจ fit — ไม่เกี่ยว |
| `darftLists` | ❌ ไม่ใช้ | ประกาศส่งถึงทุกคน ไม่มีผู้รับรายคน |
| — | `display: boolean` (default true) | ซ่อน/โชว์ (legacy ไม่มี — เพิ่มให้จัดการง่าย) |

```ts
export enum AnnouncementLinkType {
  NONE = 0,       // ไม่มีลิงก์
  EXTERNAL = 1,   // เว็บนอก → window.open
  INTERNAL = 2,   // เพจในระบบ (เช่น /my-payments) → router.push
}

@Entity({ name: `${process.env.ENV}_announcement` })
export class Announcement extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid') id: string

  @Column({ default: 0 }) pin: number

  @Column() title: string

  @Column({ type: 'text' }) description: string

  @Column({ type: 'text', nullable: true }) subDescription: string

  @Column({ nullable: true }) thumbnailImgUrl: string

  @Column({ nullable: true }) linkUrl: string

  @Column({ default: AnnouncementLinkType.NONE })
  linkType: AnnouncementLinkType

  @Column({ default: true }) display: boolean

  @Column({ type: 'uuid' }) createdBy: string   // personnel_admin
}
```

> emoji: `text` (Unicode) เก็บได้เต็มที่ — FE แสดงด้วย `whiteSpace: 'pre-line'` ให้เว้นบรรทัดตรงตามที่พิมพ์

---

## 2. BE Endpoints

### Admin (PersonnelAdminJwt + Roles: super_admin, personnel)

| Method | Path | หน้าที่ |
|---|---|---|
| POST | `/announcements` | สร้าง `{ title, description, subDescription?, thumbnailImgUrl?, linkUrl?, linkType?, pin?, display? }` |
| GET | `/announcements?take=&page=` | รายการทั้งหมด (รวม display=false — สำหรับจัดการ) |
| PATCH | `/announcements/:id` | แก้ไขทุก field |
| PATCH | `/announcements/:id/display` | toggle โชว์/ซ่อน (ปุ่มไวในตาราง) |
| PATCH | `/announcements/:id/pin` | ตั้งค่า pin |
| DELETE | `/announcements/:id` | soft delete |

### User (PersonnelJwt)

| Method | Path | หน้าที่ |
|---|---|---|
| GET | `/announcements/my` | เฉพาะ `display=true` เรียง `pin DESC, createdAt DESC` |

---

## 3. FE — Admin

**หน้า `/admin/announcements`** (เมนูใหม่):

- ปุ่ม "สร้างประกาศ" → Dialog (theme เดิม):
  - หัวข้อ *
  - **เนื้อหา (description)** — multiline ใหญ่, ใส่ emoji จากคีย์บอร์ดมือถือ/คัดลอกได้, helperText "รองรับ emoji และการเว้นบรรทัด"
  - รายละเอียดรอง (subDescription) — multiline
  - รูปประกอบ — upload R2 + preview
  - ลิงก์: select ประเภท (ไม่มีลิงก์ / ลิงก์ภายนอก / ลิงก์ภายใน) + ช่อง URL (โชว์ตามประเภท; internal = dropdown เลือก path ที่มีในระบบ)
  - Switch: ปักหมุด (pin) · แสดง (display)
- ตาราง: หัวข้อ / รูปเล็ก / ปักหมุด / แสดง (switch) / วันที่ / แก้ไข / ลบ — เรียง pin DESC

## 4. FE — User (หน้าแรก `/`)

**Section "ประกาศ" ใต้การ์ดโปรไฟล์ (ก่อนสถิติเงิน):**

- การ์ดประกาศแต่ละอัน:
  - แถบหัว: 📌 ถ้า pin > 0 + title
  - รูป thumbnail (ถ้ามี — คลิกดู BaseImageModal)
  - description — `whiteSpace: 'pre-line'` (emoji + เว้นบรรทัดตรง)
  - subDescription — จางกว่า, ถ้ายาว > 3 บรรทัด → ตัด + ปุ่ม "อ่านต่อ" เปิด dialog เต็ม
  - linkType: EXTERNAL → ปุ่มเปิดแท็บใหม่ · INTERNAL → router.push
- เรียง: pin มากก่อน → ใหม่ก่อน · โชว์สูงสุด 5 อัน บนหน้าแรก ("ดูทั้งหมด" → ทำภายหลังได้)

---

## 5. ไฟล์ที่ต้องเขียน

| ฝั่ง | ไฟล์ |
|---|---|
| BE | `modules/announcement/` (entity, dto, service, controller admin+user, module) + app.module |
| FE | `services/announcement.services.ts` · `pages/admin/announcements.tsx` · แทรก section ใน `pages/index.tsx` · sidebar item + permissions (`/admin/announcements`: super_admin, personnel) |
| i18n | `announcements.*` (title, create, pin, display, read_more, link_type ฯลฯ) th/en |

## 6. Checklist

- [x] 6.1 BE entity + synchronize
- [x] 6.2 BE admin CRUD + display/pin toggles
- [x] 6.3 BE user endpoint (`/announcements/my`)
- [x] 6.4 FE admin หน้าจัดการ + dialog สร้าง/แก้ (emoji/pre-line, image, link_type)
- [x] 6.5 FE หน้าแรก user — แถบประกาศ (pin บนสุด, BaseImageModal, read_more dialog)
- [x] 6.6 i18n + permissions + sidebar (admin)
- [x] 6.7 E2E ผ่าน: สร้าง (emoji 📢 + pin 100 + internal link) → /announcements/my ได้ 1 รายการเรียง pin ถูก → ลบ test data (2026-09-19) · หมายเหตุ: Postgres ใช้ `text` แทน ntext (ntext = SQL Server only)
