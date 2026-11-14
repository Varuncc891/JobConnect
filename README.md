# JobConnect — AI-Powered Job Portal

> A production-ready recruitment SaaS platform built with TypeScript, Redis, Docker, and AI resume parsing.  
> 🤖 AI resume parsing · ⚡ Redis caching · 📧 Email notifications · 🐳 Dockerized

🔗 **Live Demo:** https://job-connect-2.vercel.app  
📖 **API Docs:** https://jc-backend-dxuw.onrender.com/api-docs

---

![JobConnect UI](./assets/homepage.png)

---

## What is JobConnect?

JobConnect is a full-stack job portal where employers post jobs and job seekers apply. Upload your resume as a PDF and the platform automatically extracts your name, email, phone, and skills using AI, filling in your application form in under 3 seconds. When an employer accepts or rejects an application, the job seeker gets an automated email instantly.

Built to demonstrate production-grade engineering: strict TypeScript, Redis caching, Docker, CI/CD, and OWASP-aligned security.

## Highlights

- ⚡ Redis cache-aside caching on job listings (5-minute TTL, invalidated on writes, graceful fallback to MongoDB)
- 🤖 AI-powered resume parsing with automatic form filling in **< 3 seconds**
- 🔐 Secure authentication with JWT (httpOnly cookies) and RBAC
- 🐳 Dockerized stack with multi-stage builds and an Nginx reverse proxy for local Docker runs
- 🚀 Production deployment on Render + Vercel with a GitHub Actions CI/CD pipeline

---

## Features

- **TypeScript** — Full backend + frontend migration, strict mode, typed models and components.

- **Redis Caching** — Cache-aside pattern on `GET /job/getall`, URL-based keys, 5-minute TTL, invalidation on job create/update/delete, and automatic fallback to MongoDB if Redis is unavailable. `X-Cache: HIT/MISS` response headers make cache behavior easy to monitor.

- **AI Resume Parser** — Upload PDF → Apilayer API extracts name, email, phone, skills → fallback to pdf-parse if the API fails.

![Demo](./assets/resumeparser.png)

- **Docker + Compose** — Multi-stage builds, Nginx reverse proxy, full stack runs with one command.

- **RBAC** — Job Seeker / Employer / Admin roles, JWT middleware on every protected route.

- **Zod Validation** — Schema validation on all POST/PUT endpoints before hitting the controller.

- **Rate Limiting** — `express-rate-limit` on all `/api/` routes, 100 requests per 15 minutes per IP.

- **Email Notifications** — Automated accept/reject emails via Nodemailer when employer updates application status. Email failures never fail the HTTP request.

- **CI/CD** — GitHub Actions runs TypeScript compilation (`tsc --noEmit`) and Jest tests on every PR, and deploys on merge to main.

- **Swagger / OpenAPI** — Auto-generated interactive API docs at `/api-docs`.

- **Pagination + Filtering** — DB-level filtering by category, city, salary, with sorting. Active filters sync to the URL so filtered views are shareable.

- **Deployment** — Render (backend) + Vercel (frontend), cross-domain cookie auth configured.

---

## Tech Stack

**Backend:** Node.js · Express · TypeScript · MongoDB (Mongoose) · Redis (ioredis) · Zod · JWT  
**Frontend:** React · TypeScript · Vite · Tailwind CSS · Axios  
**Services:** Apilayer (AI parser) · Nodemailer · Cloudinary  
**DevOps:** Docker · Docker Compose · Nginx · GitHub Actions · Render · Vercel

---

## Architecture

### Production (Vercel + Render)

The frontend talks directly to the backend API (cross-domain, cookie auth). There is no Nginx in the production path.

```
┌──────────────┐        ┌────────────────┐
│  React +     │──────▶ │  Express +     │
│  TypeScript  │  HTTPS │  TypeScript    │
│  (Vercel)    │        │  (Render)      │
└──────────────┘        └───────┬────────┘
                                │
                 ┌──────────────┼──────────────┐
                 ▼              ▼              ▼
            ┌─────────┐   ┌─────────┐   ┌───────────┐
            │ MongoDB │   │  Redis  │   │Cloudinary │
            │ (Atlas) │   │(managed)│   │           │
            └─────────┘   └─────────┘   └───────────┘
```

### Local Docker (docker-compose)

Nginx serves the frontend and reverse-proxies `/api/*` to the backend, so the browser only talks to one origin.

```
┌─────────┐      ┌──────────────────┐      ┌────────────────┐      ┌─────────┐
│ Browser │────▶ │  Frontend        │────▶ │  Backend       │────▶ │  Redis  │
│         │      │  Nginx  :3000    │ /api │  Express :4000 │      │ (7)     │
└─────────┘      └──────────────────┘      └───────┬────────┘      └─────────┘
                                                   │
                                                   ▼
                                     MongoDB (MONGO_URI) · Cloudinary
```

---

## Quick Start

### Docker (Recommended)

```bash
git clone https://github.com/Varuncc891/JobConnect
cd JobConnect
cp backend/.env.example backend/.env
# fill in your values
docker-compose up
```

Compose starts Redis, the backend, and the frontend. MongoDB is not included in the compose file, so point `MONGO_URI` at MongoDB Atlas or a local instance.

### Manual

```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
```

Requires MongoDB and Redis running locally.

---

## Environment Variables

`backend/.env`:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET_KEY=your_jwt_secret
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
REDIS_URL=redis://localhost:6379
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
APILAYER_API_KEY=your_apilayer_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:3000
PORT=4000
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:4000
```

---

## API Docs

Interactive Swagger UI at `/api-docs`.

![JobConnect UI](./assets/apilist.png)
![JobConnect UI](./assets/result2.png)


| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/user/register` | Public | Register a new user |
| POST | `/api/v1/user/login` | Public | Login and receive auth cookie |
| GET | `/api/v1/user/logout` | Authenticated | Logout and clear auth cookie |
| POST | `/api/v1/job/post` | Employer | Post a new job |
| GET | `/api/v1/job/getall` | Public | Get all jobs with pagination and filtering |
| GET | `/api/v1/job/getmyjobs` | Employer | Get jobs posted by logged-in employer |
| GET | `/api/v1/job/{id}` | Public | Get a single job by ID |
| PUT | `/api/v1/job/update/{id}` | Employer | Update a job |
| DELETE | `/api/v1/job/delete/{id}` | Employer | Delete a job |
| POST | `/api/v1/application/post` | Job Seeker | Apply for a job |
| GET | `/api/v1/application/employer/getall` | Employer | Get all received applications |
| GET | `/api/v1/application/jobseeker/getall` | Job Seeker | Get all submitted applications |
| PUT | `/api/v1/application/status/{id}` | Employer | Accept or reject an application |
| DELETE | `/api/v1/application/delete/{id}` | Job Seeker | Delete an application |
| POST | `/api/v1/resume/parse` | Authenticated | Parse resume PDF and extract data |

---

## Testing

```bash
cd backend
npm test               # run all tests
npm test -- --coverage # with coverage
```

20+ tests covering Zod schemas, utility functions, and middleware. CI runs them on every pull request.

---

## Security

**Authentication** — JWTs stored in `httpOnly` cookies, inaccessible to JavaScript. Passwords hashed with bcrypt (10 rounds), never stored in plaintext.

**Authorization** — RBAC middleware on every protected route. Wrong role returns 403.

**Input Validation** — Zod schemas on all POST/PUT endpoints. Rejects malformed input before it reaches the database.

**Rate Limiting** — `express-rate-limit` configured on all `/api/` routes. 100 requests per 15 minutes per IP.

**CORS** — Explicit `origin: process.env.FRONTEND_URL`, no wildcard.

**Secrets** — All credentials in environment variables, never in source code. `.env` is in `.gitignore`.

| OWASP Risk | Mitigation |
|------------|------------|
| A01 Broken Access Control | RBAC middleware on all protected routes |
| A02 Cryptographic Failures | bcrypt, HTTPS in production |
| A03 Injection | Zod validation, Mongoose parameterized queries |
| A05 Security Misconfiguration | CORS whitelist, secrets in env vars |
| A07 Auth Failures | httpOnly cookies, JWT expiry (7d), bcrypt |

---

## Known Limitations

- Cache invalidation uses `redis.keys('jobs:*')`, which blocks the event loop at scale. A `SCAN`-based or versioned-prefix approach is the right fix.
- A few frontend components still use an absolute `localhost:4000` URL instead of `VITE_API_URL`, so the Docker setup is not fully same-origin for those paths.
- The resume parser depends on Apilayer. If the API is down, the `pdf-parse` fallback kicks in, but extraction quality is lower.
- Single Redis instance with no eviction policy tuning (`allkeys-lru` would be the production choice).
- Notifications are email-only, not real-time.
- The rate limit (100 requests per 15 minutes) is a global default, not tuned per endpoint.

---

## Project Structure

```
JobConnect/
├── backend/src/
│   ├── config/        # DB, Redis, Swagger
│   ├── controllers/   # Route handlers
│   ├── middleware/    # Auth, RBAC, cache, validate, rateLimit
│   ├── models/        # Mongoose + TypeScript interfaces
│   ├── routes/        # Express routers + Swagger JSDoc
│   ├── services/      # AI parser, email
│   ├── utils/         # AppError, catchAsync, sendToken
│   └── validators/    # Zod schemas
├── frontend/src/
│   ├── components/
│   ├── hooks/
│   └── utils/         # Axios API instance
├── .github/workflows/ # CI/CD
└── docker-compose.yml
```
