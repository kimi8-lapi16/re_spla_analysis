# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for "re_spla_analysis" - a Splatoon battle analysis application with a NestJS backend and React frontend. The project appears to be focused on analyzing Splatoon game battles, tracking weapons, stages, rules, and user performance data.

## Monorepo Structure

- **Package Manager**: pnpm with workspaces
- **Build Tool**: Turborepo for managing builds and tasks across apps
- **Apps**:
  - `apps/backend`: NestJS API server with Prisma ORM
  - `apps/frontend`: React + Vite application
- **Packages**: Empty directory for shared packages

## Development Commands

### Root Level (use Turbo)
```bash
# Install dependencies
pnpm install

# Run all apps in development mode (parallel)
pnpm dev

# Build all apps
pnpm build

# Lint all apps
pnpm lint

# Format code
pnpm format
```

### Backend (apps/backend)
```bash
# Development with watch mode
cd apps/backend
pnpm dev

# Build
pnpm build

# Run tests
pnpm test              # Unit tests
pnpm test:watch        # Watch mode
pnpm test:cov          # With coverage
pnpm test:e2e          # E2E tests

# Prisma commands
pnpm prisma migrate dev     # Run migrations in development
pnpm prisma generate        # Generate Prisma client
pnpm seed                   # Seed database
```

### Frontend (apps/frontend)
```bash
# Development server
cd apps/frontend
pnpm dev

# Build
pnpm build

# Preview production build
pnpm preview
```

## Database Setup

The project uses MySQL 8.0 with Prisma ORM.

### Environment Setup
1. Copy `apps/backend/.env.template` to `apps/backend/.env`
2. Set `DATABASE_URL` and `SHADOW_DATABASE_URL` (for Prisma migrations)

### Docker Setup
The project includes docker-compose.yml with MySQL database:
```bash
# Start database
docker-compose up -d db

# Start dev container
docker-compose up -d
```

### Prisma Configuration
- **Custom Output**: Prisma client is generated to `apps/backend/generated/prisma` (not default location)
- **Schema Location**: [apps/backend/prisma/schema.prisma](apps/backend/prisma/schema.prisma)
- **Migrations**: Located in `apps/backend/prisma/migrations`
- **Seed File**: [apps/backend/prisma/seed.ts](apps/backend/prisma/seed.ts)

### Database Initialization
From the root README, initialize the database with:
```bash
pnpm prisma migrate dev
```

## Architecture Notes

### Backend Data Model
The application tracks Splatoon battles with the following key entities:
- **User**: Players with authentication (UserSecret)
- **Analysis**: Battle records linking to:
  - **Weapon**: Main weapons with SubWeapon and SpecialWeapon
  - **Stage**: Battle stages/maps
  - **Rule**: Game rules (e.g., Turf War, Splat Zones)
  - **BattleType**: Type of battle
  - Result, points, and game datetime

This is a relational model where Analysis is the central entity connecting users to their battle performance data.

### Backend Stack
- **Framework**: NestJS 11
- **ORM**: Prisma with MySQL
- **Testing**: Jest with ts-jest
- **Language**: TypeScript 5.9

### Frontend Stack
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Language**: TypeScript 5.9
- **Module Type**: ESM

## Important Notes

### Prisma Client Import
When importing Prisma client in backend code, use the custom output path:
```typescript
import { PrismaClient } from '../generated/prisma';
```

### Running Single Tests
```bash
cd apps/backend
pnpm test -- path/to/test.spec.ts
```

### Turbo Caching
Turbo caches build outputs in `.turbo` directories. The `dev` task has caching disabled for live reload.
