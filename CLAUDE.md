# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS backend for "1st Army Area" — a Thai military scoring/management system. Users (military personnel) authenticate via LINE Login, admins authenticate via username/password. JWT-based auth with two separate strategies: `userJwt` (for users) and `adminJwt` (for admins).

## Commands

```bash
npm install                # Install dependencies
npm run start:dev          # Dev server with watch (default port 5001)
npm run build              # Production build
npm run start:prod         # Run production build
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting
npm test                   # Unit tests (jest, testRegex: *.spec.ts)
npm run test:e2e           # E2E tests (jest --config ./test/jest-e2e.json)
npm run test:cov           # Test coverage
```

## Architecture

**Framework**: NestJS 11, TypeScript, TypeORM, PostgreSQL

**API prefix**: All routes under `/api/`

**Swagger docs**: `/api/docs` (basic-auth protected, default admin/123456)

**Entity table naming**: Entities use `${process.env.ENV}_tablename` pattern — `ENV=dev` → `dev_user`, `dev_admin1`, etc. `synchronize: true` is enabled (TypeORM auto-syncs schema).

**Global entity base**: All entities extend `GlobalEntity` (`src/utils/global-entity.ts`) which provides `createdAt`, `updatedAt`, `isDeleted` columns.

**Two auth strategies**:
- `UserJwtStrategy` (`userJwt`): validates user by LINE ID, used with `UserJwtAuthGuard`
- `AdminJwtStrategy` (`adminJwt`): validates admin by ID, used with `AdminJwtAuthGuard`
- Both strategies set `ignoreExpiration: true`

**Modules** (`src/modules/`):
- `admin` — Admin CRUD, entity: `Admin` (uuid, username, password, name, phone, profileImage)
- `auth` — Login endpoints: `POST /auth/user/sign-in` (LINE), `POST /auth/admin/sign-in` (username/password)
- `user` — User CRUD, entity: `User` (uuid, lineId, rank, firstName, lastName, gender, base, status, OneToOne→UserScoreInfo)
- `user-score-info` — Score tracking entity linked 1:1 with User
- `user-score-history` — Score change history
- `summary` — Aggregation controller across users/scores
- `r2` — Cloudflare R2 file uploads (images, profiles, scores, docs) via AWS S3 SDK
- `config` — Config modules: `app` (port), `sql` (DB connection), `jwt` (secret), `throttle` (rate limiting), `legacy`

**i18n**: English (`en`) and Thai (`th`) translations in `src/i18n/`

**Response pattern**: All endpoints return `ResponseModel<T>` with `data`, optional `meta` (pagination total), optional `link` (prev/next).

## Environment Variables

```
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<password>
DB_DATABASE=army_area
DB_SYNCHRONIZE=true
ENV=dev|prod
R2_ACCESS_KEY=<key>
R2_SECRET_ACCESS_KEY=<secret>
R2_ACCOUNT_ID=<id>
R2_BUCKET_NAME=<bucket>
R2_RESOURCE_DOMAIN=<domain>
PORT=5001
```

## Deployment

- **Docker**: Multi-stage Dockerfile (node:18-alpine), docker-compose exposes ports 5001 + 3001 (debug)
- **CI/CD**: GitLab CI, includes pipeline template from `tlt-scommercesolution/devops-tools`
- **Helm**: Kubernetes deployment via `helm/dev-values.yaml`

## Key Conventions

- Entities use UUID primary keys (`@PrimaryGeneratedColumn('uuid')`)
- `class-validator` + `class-transformer` for DTO validation (global `ValidationPipe` with `transform: true`)
- Helmet middleware for security headers
- Global `ThrottlerBehindProxyGuard` for rate limiting
- `@nestjs/schedule` for cron jobs
- Thai language enums in entities (e.g., `UserBase` uses Thai military unit names)
