# Hospital Management API

REST microservice for hospital patient, doctor, appointment, and medical order management. Built with **NestJS**, **TypeORM**, and **PostgreSQL**, following **Clean Architecture** principles.

---

## Architecture

```
src/
├── common/               # Shared cross-cutting concerns
│   ├── decorators/       # @Roles(), @CurrentUser()
│   ├── enums/            # Role enum (ADMIN, DOCTOR, RECEPTIONIST)
│   ├── filters/          # GlobalExceptionFilter — standardized error responses
│   ├── guards/           # JwtAuthGuard, RolesGuard
│   ├── interceptors/     # TransformInterceptor, IdempotencyInterceptor
│   └── services/         # IdempotencyService
├── config/               # Typed configuration (app + database)
└── modules/
    ├── auth/             # JWT + RBAC authentication
    ├── patients/         # Patient CRUD with idempotency
    ├── doctors/          # Doctor CRUD
    └── appointments/     # Appointments + Medical Orders (pessimistic locking)
```

**Key design decisions:**
- **Clean Architecture**: Repository pattern abstracts DB access from service layer
- **Idempotency**: Dual-layer — DB unique constraint + `Idempotency-Key` header cache
- **Concurrency**: Pessimistic write lock (`SELECT FOR UPDATE`) prevents double booking
- **RBAC**: Three roles — `ADMIN`, `DOCTOR`, `RECEPTIONIST` — enforced per endpoint
- **Standardized errors**: Global filter maps TypeORM/HTTP errors to consistent JSON

---

## Prerequisites

- Node.js v20+
- npm v10+
- PostgreSQL 15+ (or Docker)

---

## Local Setup (without Docker)

### 1. Clone and install

```bash
git clone <repository-url>
cd hospital-management-api
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your local DB credentials
```

### 3. Start PostgreSQL and run

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api/v1`
Swagger docs at `http://localhost:3000/api/docs`

---

## Docker Setup (recommended)

```bash
# 1. Copy and configure environment
cp .env.example .env

# 2. Build and start all services
docker-compose up --build

# API:      http://localhost:3000/api/v1
# Swagger:  http://localhost:3000/api/docs
```

---

## API Endpoints

### Auth
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/auth/register` | Register new user | Public |
| POST | `/api/v1/auth/login` | Login, get JWT | Public |

### Patients
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| POST | `/api/v1/patients` | Create patient | ADMIN, RECEPTIONIST |
| GET | `/api/v1/patients` | List all (paginated) | All |
| GET | `/api/v1/patients/:id` | Get by UUID | All |
| GET | `/api/v1/patients/identification/:id` | Search by ID number | All |
| PUT | `/api/v1/patients/:id` | Update | ADMIN, RECEPTIONIST |
| DELETE | `/api/v1/patients/:id` | Delete | ADMIN |

### Doctors
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| POST | `/api/v1/doctors` | Create doctor | ADMIN |
| GET | `/api/v1/doctors` | List all (paginated) | All |
| GET | `/api/v1/doctors/:id` | Get by UUID | All |
| GET | `/api/v1/doctors/identification/:id` | Search by ID number | All |
| PUT | `/api/v1/doctors/:id` | Update | ADMIN |
| DELETE | `/api/v1/doctors/:id` | Delete | ADMIN |

### Appointments
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| POST | `/api/v1/appointments` | Schedule appointment | ADMIN, RECEPTIONIST |
| GET | `/api/v1/appointments` | List all (paginated) | All |
| GET | `/api/v1/appointments/available-doctors?date=` | Check doctor availability | All |
| GET | `/api/v1/appointments/by-date?date=YYYY-MM-DD` | Filter by date | All |
| GET | `/api/v1/appointments/patient/:identification` | By patient ID | All |
| GET | `/api/v1/appointments/:id` | Get by UUID | All |
| PATCH | `/api/v1/appointments/:id/status` | Update status | ADMIN, DOCTOR |
| POST | `/api/v1/appointments/:id/medical-orders` | Add medical order | ADMIN, DOCTOR |
| DELETE | `/api/v1/appointments/:id` | Cancel | ADMIN |

---

## Idempotency

For patient and appointment creation, include the `Idempotency-Key` header:

```
POST /api/v1/patients
Idempotency-Key: <uuid-v4>
```

Repeated requests with the same key return the cached response without creating duplicates.

---

## RBAC Roles

| Role | Capabilities |
|------|-------------|
| `ADMIN` | Full access to all endpoints |
| `DOCTOR` | Read patients/doctors, update appointment status, add medical orders (own appointments only) |
| `RECEPTIONIST` | Manage patients, schedule appointments, read doctors |

---

## Running Tests

```bash
# Unit tests
npm run test

# Coverage
npm run test:cov
```

---

## Deployment

The project is ready for deployment to any platform supporting Docker:

- **Render** — Docker deploy with managed PostgreSQL

Set production environment variables:
```
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>?sslmode=require
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```
