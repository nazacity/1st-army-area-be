# ระบบ Survey (แบบสอบถาม) นทน.105 — System Design

> ต้นแบบ: `legacy/fit/fit-api/src/modules/legacy-survey2*` (7 modules) + back-office `legacy/fit/back-office/src/views/pages/survey2` + user-side `legacy/fit/legacy-survey`
> ปรับให้เหมาะโปรเจ็คนักเรียนเสธ: **ตัด point/คะแนนออกทั้งหมด** (ไม่มี LegacySurvey2UserPoint/History) · **เก็บ weight ของตัวเลือกคำตอบไว้** (ตาม requirement) · ผู้ตอบ = personnel (JWT) แทน memberCode/memberType/isPartner · ตัด partner-list/event/QR/pop-up/Excel import-export/backfill

## 1. สิ่งที่ตัดออกจาก legacy (เหตุผล)

| ของเดิม | เหตุผลที่ตัด |
|---|---|
| `Survey2.point` + UserPoint/UserPointHistory | requirement: ไม่เอา point |
| `memberType` targeting + partner-list + event import + QR | ระบบนี้ผู้ตอบคือนักเรียนเสธทั้งหมด ไม่มีการกำหนดกลุ่มเป้าหมาย |
| `isPopUp` + `/userPublic` + guest | ไม่มี public survey — ต้อง login personnel |
| Excel upload/download (คำถาม/คำตอบ/รายงาน) | เก็บไว้ทำภายหลังได้ — v1 สร้างผ่านฟอร์มแอดมิน |
| ROW_NUMBER dedupe ต่อ user ต่อคำถาม | ไม่จำเป็น — ระบบนี้บังคับ 1 submission ต่อ (survey, personnel) ที่ submit |
| backfill endpoint | point-related |

## 2. Entities (7 — ชื่อตาราง `${ENV}_survey2...`)

```
survey2 ──1:N──> survey2_part ──1:N──> survey2_question ──1:N──> survey2_question_answer
    │                                            │                        │
    └────────1:N────────> survey2_user <───N:1───┘(text)                   │(choice)
                              │ 1:N                                          │
                              ├──< survey2_user_answer >── survey2_question_answer
                              └──< survey2_user_answer_text >── survey2_question
```

| Entity | คอลัมน์ (นอกจาก GlobalEntity) |
|---|---|
| `Survey2` | title · description? · imageUrl? · startDate (timestamptz) · endDate (timestamptz) · display (default true) |
| `Survey2Part` | index (int, ลำดับใน survey) · title · display · surveyId |
| `Survey2Question` | index · question · type: `select \| multi_select \| text` · answerType: `text \| weight` · condition: `not_fixed \| more_than \| less_than` · conditionNumber (int) · imageUrl? · display · required · isUserAnswerText · isHasOther · partId |
| `Survey2QuestionAnswer` | index · answer? · imageUrl? · display · **weight (int default 0)** · isOther · isComment · questionId |
| `Survey2User` | surveyId · personnelId — 1 แถว = 1 การส่งแบบสอบถาม (createdAt = เวลาส่ง) |
| `Survey2UserAnswer` | surveyAnswerId · personnelId · answer? (ข้อความ "อื่นๆ โปรดระบุ"/isComment) · userSurveyId |
| `Survey2UserAnswerText` | questionId · personnelId · answer (text) · userSurveyId |

**weight semantics** (เหมือน legacy): คำถาม `type=select` เลือก `answerType=weight` ได้ → ตัวเลือกแต่ละอันมี "ระดับ" — ผลลัพธ์คำนวณค่าเฉลี่ย/สัดส่วนที่ FE จาก userAnswers ต่อตัวเลือก (เช่น survey ความพึงพอใจ 1–5) · survey ทั่วไป (ไซส์เสื้อ/ร้านอาหาร) ใช้ `answerType=text` ไม่ต้องใส่ weight

## 3. API (prefix `/api` · ResponseModel · เหมือน pattern โปรเจ็ค)

### แอดมิน (adminJwt + role `personnel` — super ผ่านเสมอ)

| Method | Path | รายละเอียด |
|---|---|---|
| GET | `/survey2` | รายการ + `userSurveyTotalNumber` (จำนวนคนตอบ) |
| GET | `/survey2/:id` | รายละเอียด + parts.questions (ไม่กรอง display) |
| POST / PATCH / DELETE | `/survey2/:id` | สร้าง/แก้/soft delete (ลบไม่ได้ถ้ามีคนตอบ) |
| PATCH | `/survey2/:id/display` | เปิด/ปิดแสดงผล |
| GET | `/survey2-parts?surveyId=` | หมวดทั้งหมด (sort index) |
| POST / PATCH / DELETE | `/survey2-parts/:id` | สร้าง/แก้ title/soft delete (ลบไม่ได้ถ้ามีคำถามหรือมีคนตอบ) |
| PATCH | `/survey2-parts/:id/index` · `/display` | เรียงลำดับ (shift พี่น้อง) / toggle |
| GET | `/survey2-questions?partId=` | คำถาม + answers (sort index) |
| GET | `/survey2-questions/:id` | คำถาม + answers (แต่ละ answer มี userAnswers) + `isAnswered` — ใช้ดูผล |
| POST / PATCH / DELETE | `/survey2-questions/:id` | สร้าง (พร้อม nested answers — index จากลำดับ array) / แก้ (**ถ้า isAnswered ล็อก — แก้ได้แค่ display/index**) / soft delete |
| PATCH | `/survey2-questions/:id/index` · `/display` | reorder / toggle |
| GET | `/survey2-users?surveyId=` | รายชื่อผู้ตอบ (join personnel) |

### ผู้ใช้ (personnelJwt + PersonnelPasswordChangedGuard)

| Method | Path | รายละเอียด |
|---|---|---|
| GET | `/survey2/user` | survey ที่ live (display + อยู่ในช่วงวันที่) + `isAnswered` ของเรา |
| GET | `/survey2/user/:id` | survey + parts(เฉพาะ display) → questions(display) → answers(display) + `isAnswered` — จุดเดียวพอสำหรับหน้ากรอก |
| POST | `/survey2-user` | ส่งคำตอบ (ด้านล่าง) |

### Submit validation (พอร์ตจาก legacy `validateSurvey2Answers` + เพิ่มเช็ค condition)

```
{ surveyId, answers: [{answerId, answer?}], answerTexts: [{questionId, answer}] }
```
1. survey ต้อง display + อยู่ใน [startDate, endDate]
2. answerId ต้องเป็นตัวเลือกที่ active ของคำถาม active · questionId (text) ต้อง active
3. `select`/`multi_select`: ต้องมี ≥1 ที่เลือกเสมอ · `multi_select` + condition: `more_than` ≥ n, `less_than` ≤ n · `select` เลือกได้ 1 (ซ้ำ answerId ตัดซ้ำ)
4. `text` + required: ต้องมีข้อความ
5. กันซ้ำ: มี `Survey2User(surveyId, personnelId)` อยู่แล้ว → error "ท่านได้ทำแบบสอบถามนี้ไปแล้ว"
6. ทำเป็น transaction: สร้าง user → userAnswers → userAnswerTexts

## 4. Frontend

**แอดมิน (MUI + Next.js — pattern เดียวกับ Stage 7)**

| Path | หน้า |
|---|---|
| `/admin/surveys` | ตาราง survey (รูป, หัวข้อ, ช่วงวันที่, display toggle, ตอบแล้ว N) + dialog สร้าง/แก้ + ลบ |
| `/admin/surveys/[id]` | หมวดคำถาม — เพิ่ม/แก้/เรียงลำดับ (Select 1..n)/toggle/ลบ |
| `/admin/surveys/[id]/parts/[partId]` | คำถาม — dialog ฟอร์มคำถาม + ตัวเลือก (field array): type/answerType(weight→ช่อง weight ต่อตัวเลือก)/condition/isHasOther/isUserAnswerText/required · ถ้า `isAnswered` ล็อกฟอร์ม |
| `/admin/surveys/[id]/parts/[partId]/questions/[questionId]` | ผล: ตารางตัวเลือก (จำนวนคนเลือก, %, weight) + stat คะแนนเฉลี่ย (ถ้า weight) + ตารางคำตอบข้อความ |

**ผู้ใช้ (เพิ่มแถบเมนู "แบบสอบถาม")**

| Path | หน้า |
|---|---|
| `/surveys` | การ์ด survey ที่เปิดอยู่ — สถานะ ยังไม่ตอบ/ตอบแล้ว, ปุ่มเข้าตอบ |
| `/surveys/[id]` | หน้ากรอก: stepper รายหมวด (parts) — คำถามเรียงตาม index: radio (select) / checkbox (multi_select + เช็คเงื่อนไข min/max) / textarea (text) + "อื่นๆ โปรดระบุ" + ช่องความคิดเห็น (isComment/isUserAnswerText) → กดส่ง (confirm) → หน้าสำเร็จ · ตอบแล้ว → เข้าไม่ได้ (badge ตอบแล้ว) |

> ตัดจาก legacy user-side: redux draft persistence (v1 เก็บ state ในหน้า), รูป background ตกแต่ง

## 5. Rights

| ฟีเจอร์ | super | personnel | it | building | education |
|---|:--:|:--:|:--:|:--:|:--:|
| Survey CRUD + คำถาม + ดูผล | ✅ | ✅ | ❌ | ❌ | ❌ |
| ตอบ survey | — | — | — | — | ทุก personnel ผ่าน personnelJwt |

## 6. งานเก็บต่อ (v2)

- Excel import/export คำถาม-คำตอบ และรายงานผล (พอร์ตจาก legacy `upload-excel`/`download-excel`)
- Draft ระหว่างกรอก (redux persist ตาม surveyId)
- จำกัดกลุ่มเป้าหมาย (เช่น เฉพาะพวก/เหล่า) ถ้าต้องการภายหลัง

---

## 7. Implementation Status (2026-09-17)

- [x] BE module `src/modules/survey2/` — entities 7 ตาราง (`dev_survey2*`) + DTOs + service + controllers (admin 3 + user 1) + ลงทะเบียน app.module — build ผ่าน
- [x] ทดสอบ API ครบ flow: สร้าง survey → part → คำถาม 4 แบบ (select / multi_select+condition / select+weight / text) → user list/detail → submit ผิด (เกินเงื่อนไข) ตีกลับ → submit ถูกสำเร็จ → ซ้ำตีกลับ "ท่านได้ทำแบบสอบถามนี้ไปแล้ว" → isAnswered=true → ผลลัพธ์ (userAnswers ต่อตัวเลือก + userAnswerTexts) → แก้คำถามที่มีคนตอบถูกล็อก → education 403 → respondents list join personnel
- [x] FE แอดมิน 4 หน้า: `/admin/surveys` (CRUD+toggle+จำนวนตอบ) → `[id]` (หมวด CRUD+เรียงลำดับ) → `parts/[partId]` (คำถาม CRUD — ฟอร์มคำถาม+ตัวเลือก field array พร้อม weight เมื่อ answerType=weight + isHasOther/isUserAnswerText/condition) → `questions/[questionId]` (ผล: ตารางตัวเลือก+จำนวน+%, คะแนนเฉลี่ย/%, คำตอบข้อความ)
- [x] FE ผู้ใช้: เมนู "แบบสอบถาม" ใน UserSidebar + `/surveys` (การ์ด survey live + badge ตอบแล้ว) + `/surveys/[id]` (กรอกแบบ stepper รายหมวด — radio/checkbox+เงื่อนไข/text/อื่นๆ/ความคิดเห็น + ส่งด้วย confirm + หน้าตอบแล้ว)
- [x] FE build ผ่าน (40 routes) + render ทดสอบ — ลบ template leftover ที่ไม่ใช้ออก (`dto/survey2.dto.ts`, `services/survey.services.ts`, `services/user.services.ts`, `models/user.model.ts`)
- หมายเหตุ: มีข้อมูลตัวอย่าง "Survey ทดสอบ ไซส์เสื้อรุ่น" (ตอบแล้ว 1 คน = 105105 ด้วยรหัส svtest123 — reset กลับได้ผ่าน admin reset-password) ค้างใน dev DB ไว้ทดสอบหน้า FE
