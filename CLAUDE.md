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

### Layered Architecture Guidelines

This project follows a layered architecture pattern with clear separation of concerns:

#### Repository Layer

- **Purpose**: Handle CRUD operations for a **single table only**
- **Rules**:
  - One repository per database table (e.g., `UserRepository` for `User` table, `UserSecretRepository` for `UserSecret` table)
  - Should NOT directly access or join other tables
  - Should NOT use Prisma's `include` or `select` to fetch related data from other tables
  - Only contain basic CRUD operations: `create`, `findById`, `findByEmail`, `update`, `delete`, etc.
  - **Must support transactions** by accepting an optional transaction parameter
- **Transaction Support**:

  ```typescript
  // Define PrismaTransaction type in src/prisma/prisma.types.ts (DRY principle)
  import { PrismaService } from "./prisma.service";

  export type PrismaTransaction = Omit<
    PrismaService,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >;
  ```

- **Example**:

  ```typescript
  import { PrismaTransaction } from "../prisma/prisma.types";

  @Injectable()
  export class UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    // ✅ Good: Single table operation with transaction support
    async create(data: { name: string; email: string }, tx?: PrismaTransaction): Promise<User> {
      const client = tx ?? this.prisma;
      return client.user.create({
        data: {
          name: data.name,
          email: data.email,
        },
      });
    }

    // ✅ Good: Read operations without transaction (default client)
    async findByEmail(email: string): Promise<User | null> {
      return this.prisma.user.findUnique({
        where: { email },
      });
    }

    // ❌ Bad: Multi-table operation (includes UserSecret)
    async findByEmail(email: string): Promise<UserWithSecret | null> {
      return this.prisma.user.findUnique({
        where: { email },
        include: { secret: true }, // Don't do this in Repository!
      });
    }
  }
  ```

#### UseCase Layer

- **Purpose**: Orchestrate business logic that spans multiple tables or repositories
- **Rules**:
  - Handle operations that require data from multiple tables
  - Coordinate multiple repository calls using their repository methods
  - Use Prisma transactions when multiple writes need to be atomic
  - Pass transaction context to repository methods
  - Place UseCases in `{module}.usecase.ts` (e.g., `user.usecase.ts`)
  - Name classes based on the primary entity (e.g., `CreateUserUseCase` for User + UserSecret)
- **File Organization**:
  - Use a single `{module}.usecase.ts` file per module instead of a `usecases/` directory
  - Define composite types in `dto.ts` to avoid duplication
- **Example**:

  ```typescript
  // src/user/dto.ts - Define composite types here
  export type UserWithSecret = User & { secret: UserSecret | null };

  // src/user/user.usecase.ts - All UseCases for the user module
  import { PrismaTransaction } from '../prisma/prisma.types';
  import { UserWithSecret } from './dto';

  @Injectable()
  export class CreateUserUseCase {
    constructor(
      private readonly prisma: PrismaService,
      private readonly userRepository: UserRepository,
      private readonly userSecretRepository: UserSecretRepository,
    ) {}

    // ✅ Good: Use repository methods with transaction
    async execute(data: {
      name: string;
      email: string;
      password: string;
    }): Promise<UserWithSecret> {
      return this.prisma.$transaction(async (tx) => {
        // Pass transaction to repository methods
        const user = await this.userRepository.create(
          { name: data.name, email: data.email },
          tx,
        );
        const secret = await this.userSecretRepository.create(
          { userId: user.id, password: data.password },
          tx,
        );
        return { ...user, secret };
      });
    }
  }

  @Injectable()
  export class FindUserWithSecretUseCase {
    constructor(
      private readonly userRepository: UserRepository,
      private readonly userSecretRepository: UserSecretRepository,
    ) {}

    // ✅ Good: Coordinate multiple repository reads
    async byEmail(email: string): Promise<UserWithSecret | null> {
      const user = await this.userRepository.findByEmail(email);
      if (!user) return null;

      const secret = await this.userSecretRepository.findByUserId(user.id);
      return { ...user, secret };
    }
  }

  // ❌ Bad: Direct Prisma operations instead of using repositories
  async execute(data: { name: string; email: string; password: string }) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { name, email } }); // Don't do this!
      const secret = await tx.userSecret.create({ data: { userId: user.id, password } });
      return { ...user, secret };
    });
  }
  ```

#### Service Layer

- **Purpose**: Handle application logic and coordinate between UseCases, Repositories, and external services
- **Rules**:
  - Use UseCases for multi-table operations
  - Use Repositories directly for single-table queries
  - Handle business validations and transformations
  - Transform data into DTOs for API responses
- **Example**:

  ```typescript
  @Injectable()
  export class UserService {
    constructor(
      private readonly userRepository: UserRepository,
      private readonly createUserUseCase: CreateUserUseCase,
      private readonly findUserWithSecretUseCase: FindUserWithSecretUseCase
    ) {}

    async createUser(dto: CreateUserDto) {
      // Check existence using repository (single table)
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) throw new ConflictException("Email already exists");

      // Create user with secret using UseCase (multi-table)
      const user = await this.createUserUseCase.execute(dto);
      return this.toUserResponse(user);
    }

    async authenticate(email: string, password: string) {
      // Find user with secret using UseCase (multi-table)
      const user = await this.findUserWithSecretUseCase.byEmail(email);
      // ... validate password
    }
  }
  ```

#### When to Use Each Layer

| Operation Type              | Use                      | Example                               |
| --------------------------- | ------------------------ | ------------------------------------- |
| Single table read           | Repository directly      | `userRepository.findById()`           |
| Single table write          | Repository directly      | `userRepository.update()`             |
| Multi-table read            | UseCase                  | `findUserWithSecretUseCase.byEmail()` |
| Multi-table write           | UseCase with transaction | `createUserUseCase.execute()`         |
| Business logic + validation | Service                  | `userService.createUser()`            |

### TypeScript Best Practices

#### Type Safety Rules

**CRITICAL: NEVER use type assertions in production or test code**

1. **Type Assertions (`as any`, `as unknown as Type`, `as SomeType`)**
   - **Strictly forbidden** in all code (production and tests)
   - These bypass TypeScript's type system and hide real type issues
   - **Exception**: Only when TypeScript's type inference has fundamental limitations (extremely rare)

   ```typescript
   // ❌ Bad: Using type assertions
   const user = request.user as CurrentUser;
   prismaService.user.create.mockResolvedValue(mockUser as any);
   const data = response.data as UserData;

   // ✅ Good: Use type guards
   function isCurrentUser(user: unknown): user is CurrentUser {
     return (
       typeof user === 'object' &&
       user !== null &&
       'userId' in user &&
       'email' in user &&
       typeof user.userId === 'string' &&
       typeof user.email === 'string'
     );
   }

   const user: unknown = request.user;
   if (!isCurrentUser(user)) {
     return undefined;
   }
   // Now user is properly typed as CurrentUser

   // ✅ Good: Define proper types for mocks
   const mockUser: User = {
     id: "test-id",
     name: "Test User",
     email: "test@example.com",
     createdAt: new Date(),
     updatedAt: new Date(),
     deletedAt: null,
   };
   prismaService.user.create.mockResolvedValue(mockUser);
   ```

2. **Type Guards**
   - Always use type guards to narrow types safely
   - Create reusable type guard functions for common patterns

   ```typescript
   // ✅ Good: Type guard pattern
   function isValidResponse(data: unknown): data is ResponseType {
     return (
       typeof data === 'object' &&
       data !== null &&
       'status' in data &&
       typeof data.status === 'number'
     );
   }

   const response: unknown = await fetch(url);
   if (!isValidResponse(response)) {
     throw new Error('Invalid response');
   }
   // response is now properly typed as ResponseType
   ```

3. **ESLint Disable Comments**
   - Never use `// eslint-disable` or `// @ts-ignore` to suppress warnings
   - Fix the underlying issue instead

   ```typescript
   // ❌ Bad: Suppressing type errors
   // @ts-ignore
   const result = someFunction();

   // ✅ Good: Fix the type issue properly
   const result: ExpectedType = someFunction();
   ```

### Testing Best Practices

#### Anti-Patterns to Avoid

**NEVER use these patterns in test code:**

1. **Type Assertions** - See TypeScript Best Practices section above
2. **ESLint Disable Comments** - See TypeScript Best Practices section above

#### Proper Mock Type Definitions

**For Prisma Service Mocks:**

```typescript
// Define a custom mock type for Prisma operations
type MockPrismaService = {
  user: {
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

describe("UserRepository", () => {
  let prismaService: MockPrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    prismaService = module.get<MockPrismaService>(PrismaService);
  });
});
```

**For Complex Dependencies:**

```typescript
// If a dependency requires specific methods, define an interface
export interface ResponseWithCookie {
  cookie(name: string, val: string, options: CookieOptions): this;
}

// Use the interface in your service
class AuthService {
  setRefreshTokenCookie(res: ResponseWithCookie, token: string) {
    res.cookie("refreshToken", token, { httpOnly: true });
  }
}

// Mock implementation in tests
const mockResponse: ResponseWithCookie = {
  cookie: jest.fn().mockReturnThis(),
};
```

**For Mock Data:**

```typescript
// Always use proper Prisma types for mock data
import { User, UserSecret } from "generated/prisma/client";

const mockUserSecret: UserSecret = {
  userId: "test-user-id",
  password: "hashed-password",
};

const mockUser: User = {
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};
```

#### Type-Safe Test Patterns

When testing error conditions that require null/undefined:

```typescript
// ❌ Bad: Using type assertions
createUserUseCase.execute.mockResolvedValue(null as any);

// ✅ Good: Use mockRejectedValue for error cases
createUserUseCase.execute.mockRejectedValue(new InternalServerErrorException("Database error"));

// ✅ Also Good: If null is a valid return, adjust the return type
// In this case, the function signature should be:
// execute(): Promise<User | null>
```

### Frontend Stack

- **Framework**: React 19
- **Build Tool**: Vite 7
- **Language**: TypeScript 5.9
- **Module Type**: ESM

## Important Notes

### Prisma Client Import

When importing Prisma client in backend code, use the custom output path:

```typescript
import { PrismaClient } from "../generated/prisma";
```

### Running Single Tests

```bash
cd apps/backend
pnpm test -- path/to/test.spec.ts
```

### Turbo Caching

Turbo caches build outputs in `.turbo` directories. The `dev` task has caching disabled for live reload.
