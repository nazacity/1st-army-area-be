# CHANGELOG

History of changes across all branches. Newest entries at the TOP.

## 2026-09-30 — main (8b2a729)

Release 1.0.0 — initial tagged release: นทน. 105 personnel management + vehicle module

### Features
- feat(personnel-vehicle): add vehicle module + xlsx import (`8b2a729`)
- feat(personnel): personnel, group, room, payment modules; CSV import/import-update; LINE login; my-peers; personnel-admin split (`36f48b6`, `c02a017`, `9be4303`, `54e3ce9`, `0752e35`)
- feat(groups): edit group members by student code list (`443afc4`)
- feat(api): bootstrap import/export, announcements, notifications, profile images (`38e3210`)
- feat(survey2): add survey system (no points, weighted answers) (`d891026`)
- feat(voltra): integrate Voltra widgets, live activities, and push (`706e658`)
- feat(unit-user-vehicle): vehicle CRUD, lookup endpoints, image management (`8bf70a4`, `3f5e304`, `382df4f`)
- feat(building/unit-summary): unit-scoped access control, admin auth guards, summary endpoints (`e9f3d9d`, `0909bad`, `80dab47`, `63cbc53`)

### Fixes
- fix(personnel): harden type-enum migration + fix page-guard label (`4dec283`)
- fix(swagger): register bootstrap token scheme + personnel admin bearer (`84d24b9`)

### Refactors
- refactor(personnel): switch PersonnelType enum to English keys (`ef56ac7`)

---
