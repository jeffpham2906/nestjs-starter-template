# NestJS Starter Template

A feature-rich NestJS starter template with PostgreSQL database and Prisma ORM. This template provides a solid foundation for building scalable backend applications with best practices and development tools already configured.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Database Management](#database-management)
- [Development](#development)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Docker** and **Docker Compose** (for local database)

## 🛠 Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL (via Docker)
- **ORM**: Prisma 7.x
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier, Husky
- **Runtime**: SWC for fast compilation

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <your-project-name>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your preferred settings (default values work out of the box):

```env
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=your_database_name
POSTGRES_PORT=5432

# Prisma Database URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/your_database_name?schema=public"

# Application Configuration
NODE_ENV=development
PORT=3000
```

### 4. Setup Database & Run Migrations

This single command will:
- Start PostgreSQL container
- Wait for database to be ready
- Run Prisma migrations
- Generate Prisma client

```bash
npm run db:setup
```

### 5. Start Development Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## 🗄 Database Management

### Docker Commands

```bash
# Start PostgreSQL container
npm run db:up

# Stop PostgreSQL container
npm run db:down

# Restart PostgreSQL container
npm run db:restart

# View PostgreSQL logs
npm run db:logs

# Wait for database to be ready
npm run db:wait
```

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Deploy migrations to production
npm run prisma:migrate:deploy

# Reset database (⚠️ WARNING: Deletes all data)
npm run prisma:reset

# Check migration status
npm run prisma:migrate:status

# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Seed the database
npm run prisma:seed

# Push schema changes without migrations
npm run prisma:push

# Pull schema from database
npm run prisma:pull

# Validate schema
npm run prisma:validate

# Format schema file
npm run prisma:format
```

## 💻 Development

### Running the Application

```bash
# Development mode with watch
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Debug tests
npm run test:debug
```

## 📁 Project Structure

```
nestjs-starter/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── scripts/
│   └── wait-for-db.js         # Database readiness checker
├── src/
│   ├── app.module.ts          # Root module
│   ├── app.controller.ts      # Root controller
│   ├── app.service.ts         # Root service
│   └── main.ts                # Application entry point
├── test/
│   ├── app.e2e-spec.ts        # E2E tests
│   └── jest-e2e.json          # E2E test configuration
├── compose.yaml               # Docker Compose configuration
├── .env                       # Environment variables (not in git)
├── .env.example               # Environment variables template
└── package.json               # Project dependencies & scripts
```

## 📜 Available Scripts

### Application

| Script | Description |
|--------|-------------|
| `npm run build` | Build the application |
| `npm run start` | Start the application |
| `npm run start:dev` | Start in development mode with watch |
| `npm run start:debug` | Start in debug mode |
| `npm run start:prod` | Start in production mode |

### Database

| Script | Description |
|--------|-------------|
| `npm run db:setup` | Complete database setup (recommended for first-time setup) |
| `npm run db:up` | Start PostgreSQL container |
| `npm run db:down` | Stop PostgreSQL container |
| `npm run db:restart` | Restart PostgreSQL container |
| `npm run db:logs` | View PostgreSQL logs |
| `npm run db:reset` | Reset database and migrations |

### Prisma

| Script | Description |
|--------|-------------|
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Create and apply migration |
| `npm run prisma:migrate:deploy` | Deploy migrations (production) |
| `npm run prisma:migrate:status` | Check migration status |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run prisma:seed` | Seed database with sample data |
| `npm run prisma:format` | Format Prisma schema |

### Testing & Quality

| Script | Description |
|--------|-------------|
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Lint and fix code |
| `npm run format` | Format code with Prettier |

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | PostgreSQL username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `postgres` |
| `POSTGRES_DB` | PostgreSQL database name | `your_database_name` |
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `DATABASE_URL` | Full database connection string | Constructed from above |
| `NODE_ENV` | Application environment | `development` |
| `PORT` | Application port | `3000` |

## 🗃 Database Schema

This template uses Prisma ORM with PostgreSQL. The database schema is defined in `prisma/schema.prisma` and can be customized to fit your application's needs.

### Getting Started with Schema

1. **Define your models** in `prisma/schema.prisma`
2. **Generate Prisma Client** after schema changes:
   ```bash
   npm run prisma:generate
   ```
3. **Create and run migrations**:
   ```bash
   npm run prisma:migrate
   ```

### Example Model

To add a new model, update the schema file:

```prisma
model User {
  id        BigInt   @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Prisma Studio

Use Prisma Studio to interact with your database visually:

```bash
npm run prisma:studio
```

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Docker Documentation](https://docs.docker.com)

## 📄 License

This project is [MIT licensed](LICENSE).
