# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LocalPro Provider Service Backend — a NestJS 11 API for a local services marketplace connecting clients with service providers. Uses Clean Architecture with Prisma/PostgreSQL.

## Common Commands

```bash
npm run build              # Compile TypeScript
npm run start:dev          # Dev server with watch mode
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting
npm test                   # Run unit tests
npm run test:watch         # Tests in watch mode
npm run test:cov           # Test coverage report
npm run test:e2e           # End-to-end tests
npx prisma migrate dev     # Create/apply migrations
npx prisma generate        # Regenerate Prisma client
npm run seed               # Seed database
```

## Architecture

Three-layer Clean Architecture:

- **`src/core/`** — Pure business logic, framework-independent
  - `entities/` — Domain models (plain TS classes with `Partial<T>` constructors)
  - `repositories/` — Interface contracts (e.g., `IUserRepository`)
  - `use-cases/` — Single-responsibility business operations (`@Injectable()` classes with `execute()` method)

- **`src/application/`** — NestJS framework layer
  - `modules/` — Feature modules (auth, providers, bookings, service-requests, reviews, messages, favorites, disputes, admin, uploads, ai, categories, notifications)
  - `common/` — Guards (`JwtAuthGuard`, `RolesGuard`), decorators (`@CurrentUser`, `@Roles`), filters (`GlobalExceptionFilter`)
  - `gateways/` — WebSocket gateway (Socket.io)

- **`src/infrastructure/`** — External integrations
  - `database/repositories/` — Prisma implementations of core repository interfaces
  - `database/prisma.service.ts` — PrismaClient wrapper
  - `services/` — Email (Nodemailer), etc.

## Key Patterns

**Dependency Injection for repositories:**
```typescript
// In module providers:
{ provide: 'IUserRepository', useClass: PrismaUserRepository }
// In use case constructor:
@Inject('IUserRepository') private repo: IUserRepository
```

**Module wiring:** Each module registers its controller, service, use cases, and repository bindings. Services orchestrate use cases; controllers call services.

**Auth flow:** JWT + Passport. Access tokens (15m) + refresh tokens (7d). Role-based access via `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(UserRole.PROVIDER)`. Roles: CLIENT, PROVIDER, ADMIN.

**Global setup (main.ts):** Helmet, CORS, ValidationPipe (whitelist + transform + forbidNonWhitelisted), GlobalExceptionFilter, `/api` prefix, Throttler guard.

## Database

PostgreSQL via Prisma ORM. Schema in `prisma/schema.prisma`. Key models: User, Provider, ServiceRequest, Booking, Review, Message, Favorite, Dispute, Notification, Category, BlockedDate.

Migrations are in `prisma/migrations/` and committed to version control.

## TypeScript Config

- Target: ES2022, Module: nodenext
- `strictNullChecks: true` but `strict: false` overall
- `experimentalDecorators` and `emitDecoratorMetadata` enabled

## Environment Variables

Requires `.env` with: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, SMTP config, Cloudinary credentials, Groq API key.
