# NOTIFICATION SYSTEM — กระดิ่งแจ้งเตือนในแอป (ไม่มี push จริง)

> สถานะ: **เสร็จ + E2E ผ่าน** — สร้าง 2026-09-19
> ขอบเขต: admin ส่งประกาศถึงกำลังพล (เลือกผู้รับได้: ทั้งหมด / เฉพาะพวก / เฉพาะเหล่า / เฉพาะบุคคล) · user เห็นกระดิ่งบน topbar → popover รายการ → กดเปิด dialog อ่านเนื้อหา

---

## 1. โครงสร้าง DB (2 ตาราง)

### 1.1 `${ENV}_notification` — ตัวประกาศ

```ts
export enum NotificationTargetType {
  ALL = 'all',
  GROUP = 'group',      // เฉพาะพวก (1–9)
  BRANCH = 'branch',    // เฉพาะเหล่า
  USER = 'user',        // เฉพาะบุคคล
}

@Entity({ name: `${process.env.ENV}_notification` })
export class Notification extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid') id: string

  @Column() title: string

  @Column({ type: 'text' }) message: string      // text — ใส่ emoji ได้

  @Column({ type: 'enum', enum: NotificationTargetType })
  targetType: NotificationTargetType

  @Column({ type: 'uuid', nullable: true })       // ใช้เมื่อ targetType = GROUP
  groupId: string | null

  @Column({ type: 'varchar', nullable: true })    // ใช้เมื่อ targetType = BRANCH (เช่น "ราบ", "ม้า")
  branch: string | null

  @Column({ nullable: true }) imageUrl: string    // รูปประกอบ (R2) — optional

  @Column({ type: 'uuid' }) createdBy: string     // personnel_admin ที่ส่ง
}
```

### 1.2 `${ENV}_notification_recipient` — ผู้รับ (fan-out)

```ts
@Entity({ name: `${process.env.ENV}_notification_recipient` })
export class NotificationRecipient extends GlobalEntity {
  @PrimaryGeneratedColumn('uuid') id: string

  @Column({ type: 'uuid', name: 'notification_id' })
  notificationId: string

  @Column({ type: 'uuid', name: 'personnel_id' })
  personnelId: string

  @Column({ type: 'timestamptz', nullable: true })
  readAt: Date | null        // null = ยังไม่อ่าน → นับ unread ได้
}
```

**ทำไม fan-out** (แทนคำนวณ target ตอนอ่าน):
- สถานะอ่าน/ยังไม่อ่าน **ต่อรายคน** — คำนวณ target สดไม่ทำได้
- แก้ตัวเลือก/ย้ายพวกภายหลังไม่กระทบประกาศที่ส่งไปแล้ว
- ตรง pattern เดิมของ legacy (`Sys_Legacy_NoficationPartnerList`)

**ตอนส่ง**: ตาม targetType → query personnel ที่ตรงเงื่อนไข (isDeleted=false) → insert recipient 1 แถว/คน (bulk insert)

---

## 2. BE Endpoints

### Admin (PersonnelAdminJwt + Roles: super_admin, personnel)

| Method | Path | หน้าที่ |
|---|---|---|
| POST | `/notifications` | สร้าง + fan-out recipients `{ title, message, imageUrl?, targetType, groupId?, branch?, userIds? }` |
| GET | `/notifications?take=&page=` | รายการที่ส่ง + จำนวนผู้รับ/จำนวนอ่านแล้ว (meta) |
| GET | `/notifications/:id` | รายละเอียด + รายชื่อผู้รับ + สถานะอ่าน (สำหรับหน้าดูสถิติ) |
| DELETE | `/notifications/:id` | soft delete (ลบ recipients ด้วย) |

### User (PersonnelJwt + PersonnelPasswordChangedGuard)

| Method | Path | หน้าที่ |
|---|---|---|
| GET | `/notifications/my?take=&page=` | ของตัวเอง (join notification) เรียงใหม่สุด + meta.unreadCount |
| POST | `/notifications/my/:id/read` | mark read (set readAt = now) |
| POST | `/notifications/my/read-all` | อ่านทั้งหมด (optional — ปุ่มใน popover) |

---

## 3. FE — ฝั่ง Admin

**หน้า `/admin/notifications`** (เมนูใหม่ — role super_admin, personnel):

- ปุ่ม "ส่งประกาศ" → Dialog (theme เดิม):
  - หัวข้อ (title) *
  - เนื้อหา (message) — multiline, ใส่ emoji ได้ *
  - รูปประกอบ (optional — upload R2)
  - **ผู้รับ (tabs):**
    - ทั้งหมด — ไม่ต้องเลือก
    - เฉพาะพวก — เลือกพวก (multi 1–9)
    - เฉพาะเหล่า — เลือกเหล่า (multi จาก options จริงใน DB)
    - เฉพาะบุคคล — **Autocomplete multi-select + ค้นหาชื่อ/รหัส** (✅ 2026-09-20)
- ตารางประกาศที่ส่ง: หัวข้อ / ผู้รับ N คน / อ่านแล้ว N / วันที่ / ลบ
- กดแถว → dialog สถิติ: รายชื่อ + อ่านแล้ว/ยังไม่อ่าน

## 4. FE — ฝั่ง User

**Topbar (Topbar.tsx รับ prop `side`):**
- icon `NotificationsRoundedIcon` + Badge (จำนวน unread — query unreadCount, **refetchInterval 60s** — ไม่มี websocket)
- กด → **Popover** (width ~360):
  - หัว: "การแจ้งเตือน" + ปุ่ม "อ่านทั้งหมด"
  - รายการ 10 รายการล่าสุด: title / วันที่ (dayjs) / จุดฟ้า = ยังไม่อ่าน / อ่านแล้วจาง
  - ปุ่ม "ดูทั้งหมด" → หน้า `/notifications` (list เต็ม, ทำภายหลังได้)
- กดรายการ → **Dialog** แสดงเนื้อหาเต็ม: title, รูป, message (เว้นบรรทัด + emoji), วันที่ → mark read อัตโนมัติ
- กดนอก popover → ปิด (ไม่ mark read)

---

## 5. i18n keys (th/en)

```
notifications.title        การแจ้งเตือน / Notifications
notifications.empty        ไม่มีการแจ้งเตือน / No notifications
notifications.read_all     อ่านทั้งหมด / Mark all read
notifications.recipients   ผู้รับ / Recipients
notifications.read_count   อ่านแล้ว / Read
notifications.send         ส่งประกาศ / Send notification
notifications.target_*     ทั้งหมด/เฉพาะพวก/เฉพาะเหล่า/เฉพาะบุคคล
```

---

## 6. ไฟล์ที่ต้องเขียน

| ฝั่ง | ไฟล์ |
|---|---|
| BE | `modules/notification/` (entity 2, dto, service, controller admin+user, module) + app.module |
| FE | `services/notification.services.ts` · `pages/admin/notifications.tsx` · Topbar (bell + popover) · `NotificationListDialog` component · sidebar item + permissions (`/admin/notifications`: super_admin, personnel) |
| i18n | keys ตาม §5 |

## 7. Checklist

- [x] 7.1 BE entities + synchronize
- [x] 7.2 BE admin CRUD + fan-out (query target → bulk insert recipients)
- [x] 7.3 BE user endpoints (my + read + read-all + unreadCount)
- [x] 7.4 FE admin หน้าสร้าง/ตรวจสถิติ
- [x] 7.5 FE Topbar bell + popover + dialog + Badge unread (poll 60s)
- [x] 7.6 i18n + permissions + sidebar (admin)
- [x] 7.7 E2E ผ่าน: ส่ง all → user เห็น unread 1 → mark read → unread 0; ลบ test data แล้ว (2026-09-19)
