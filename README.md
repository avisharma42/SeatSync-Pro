# Optimized Seat Management

Full-stack seat booking system for hybrid office operations.

## Stack

- Frontend: React + Tailwind + Framer Motion
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Auth: JWT
- Background job: node-cron (3 PM release window)
- Real-time sync: Socket.IO

## Core Features

- JWT login and protected APIs
- Weekly rotating Batch A/B rule engine
- Fixed vs floater seat logic
- Holiday blocking
- Leave handling to release seats
- Auto seat allocation (when seat not provided)
- Conflict prevention via unique booking indexes
- Admin tools: users, holidays, force release, analytics
- Real-time-like availability refresh (polling every 20s)
- Real-time seat updates via WebSocket events

## Office Model

- Seats: 50 total (40 fixed, 10 floater)
- Employees: 180 (seeded)
- Squads: 10
- Batches: A/B alternating weekly schedule

## API Summary

### Auth

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

### Bookings

- `GET /api/bookings/me`
- `GET /api/bookings/availability?date=YYYY-MM-DD`
- `POST /api/bookings` (date + optional seatId)
- `PATCH /api/bookings/:id/cancel`
- `POST /api/bookings/leave`

### Admin

- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/:id`
- `GET /api/admin/holidays`
- `POST /api/admin/holidays`
- `GET /api/admin/analytics/utilization?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `POST /api/admin/force-release`

## Local Run

### 1) Start MongoDB

Run local MongoDB or update `server/.env` to your cluster URI.

### 2) Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3) Seed data

```bash
cd server
npm run seed
```

Seed includes:

- Admin: `admin@org.com` / `admin123`
- 180 employees: `employee1@org.com` ... `employee180@org.com` with password `password123`

### 4) Run backend and frontend

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2:

```bash
cd client
npm run dev
```

Open `http://localhost:5173`.

Optional frontend env:

- `VITE_API_URL=http://localhost:5000/api`

## Project Structure

- `server/src/models`: Mongo schemas
- `server/src/services`: business rules and analytics
- `server/src/controllers`: route handlers
- `server/src/routes`: REST routes
- `server/src/jobs`: cron jobs
- `client/src/pages`: login and dashboard
- `client/src/components`: UI modules
- `client/src/context`: auth state
- `client/src/api`: API layer
