# ReachInbox Email Scheduler

A full-stack email scheduling application built to manage SMTP senders, create email campaigns, schedule deliveries, and process email jobs asynchronously using BullMQ and Redis.

## Overview

ReachInbox Email Scheduler provides a reliable workflow for creating and managing email campaigns.

Users can:

- Create and manage SMTP sending accounts
- Test SMTP connections
- Create email campaigns
- Add recipients
- Schedule campaigns
- Configure delay between emails
- Configure hourly sending limits
- Start and cancel campaigns
- Track email delivery status
- Monitor campaign progress from the dashboard

The application uses a persistent database for application data and Redis + BullMQ for asynchronous email job processing.

---

## Features

### Authentication

- User login
- User-specific campaign and sender data
- Protected application workflow

### Sender Management

- Add SMTP sending accounts
- Edit sender information
- Delete senders
- Test SMTP connection
- Configure hourly sending limits
- SMTP passwords are stored on the backend and are never returned to the frontend

### Campaign Management

- Create email campaigns
- Configure subject and email body
- Select an SMTP sender
- Add recipients
- Configure start date and time
- Configure delay between emails
- Configure hourly sending limit
- Start campaigns
- Cancel campaigns
- View campaign details

### Email Processing

- BullMQ-based asynchronous email processing
- Redis-backed job queue
- Dedicated email worker
- Configurable worker concurrency
- SMTP delivery using Nodemailer
- Email delivery status tracking
- Attempts and error tracking

### Dashboard

- Total campaigns
- Total email jobs
- Successfully sent emails
- Failed email jobs
- Recent campaigns
- Campaign progress

---

## Architecture

```text
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │   Vite + Tailwind   │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │ Express Backend     │
                    │ TypeScript          │
                    └──────────┬──────────┘
                               │
                  ┌────────────┴────────────┐
                  │                         │
                  ▼                         ▼
        ┌─────────────────┐       ┌─────────────────┐
        │ PostgreSQL      │       │ Redis           │
        │ Prisma ORM      │       │ BullMQ          │
        └─────────────────┘       └────────┬────────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │ Email Worker    │
                                  │ BullMQ Worker   │
                                  └────────┬────────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │ Nodemailer      │
                                  │ SMTP            │
                                  └────────┬────────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │ Gmail / SMTP    │
                                  └─────────────────┘

```

---

## Technology Stack

### Frontend
- React
- Vite
- JavaScript / JSX
- Tailwind CSS
- Axios
- Lucide React

### Backend
- Node.js
- TypeScript
- Express.js
- Prisma ORM
- Nodemailer

### Database
- PostgreSQL
- Prisma Migrations

### Queue and Background Processing
- Redis
- BullMQ
- Dedicated Email Worker

### Development Tools
- Git
- GitHub
- VS Code
- Docker / Docker Compose

---

## Project Structure

```text
reachinbox-email-scheduler/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── queues/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── workers/
│   │   ├── server.ts
│   │   └── worker.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   │
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
├── .gitignore
└── README.md

```

---

## How Email Scheduling Works

1. The user creates a campaign from the React frontend.
2. The backend validates and stores the campaign data.
3. The user starts the campaign.
4. Email jobs are created and processed through BullMQ.
5. Redis manages the queue.
6. The dedicated email worker processes the jobs.
7. Nodemailer connects to the configured SMTP server.
8. The email is sent to the recipient.
9. Delivery status is updated in the database.
10. Campaign and dashboard statistics are updated.

```text
Create Campaign
      ↓
PostgreSQL
      ↓
Start Campaign
      ↓
BullMQ / Redis
      ↓
Email Worker
      ↓
Nodemailer
      ↓
SMTP Server
      ↓
Recipient
      ↓
Delivery Status
      ↓
SENT / FAILED


```

---

## Rate Limiting and Send Spacing

Campaigns support:

- Configurable delay between emails
- Configurable hourly sending limits
- Queue-based background processing
- Send-spacing service
- Rate-limit service
- Job rescheduling support

These controls help prevent emails from being sent faster than the configured campaign limits.

---

## Worker Concurrency

The email worker supports configurable concurrency.

Example:

```text
Email worker started with concurrency: 5
Redis connected
```

Multiple queued jobs can be processed according to the configured worker concurrency.

---

## SMTP Configuration

The application supports SMTP sending accounts.

Example Gmail configuration:

```text
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Username: your-email@gmail.com
SMTP Password: Gmail App Password
```

Ethereal SMTP can also be used for development and testing.

> Never commit real SMTP passwords, Gmail App Passwords, database passwords, JWT secrets, or other credentials to GitHub.

---

## Environment Variables

Create the required `.env` files locally.

Example backend configuration:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret
```

Example frontend configuration:

```env
VITE_API_URL=http://localhost:5000/api
```

The actual environment variable names should match the project's configuration files.

Real `.env` files are excluded from Git using `.gitignore`.

---

## Prerequisites

Install:

- Node.js
- npm
- PostgreSQL
- Redis
- Git

Docker can also be used for supporting services.

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Abhishekgv04/reachinbox-email-scheduler.git
cd reachinbox-email-scheduler
```

---

## Backend Setup

```bash
cd backend
npm install
```

Configure the backend `.env` file.

Run database migrations:

```bash
npx prisma migrate dev
```

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

---

## Start the Email Worker

Open another terminal:

```bash
cd backend
npm run worker
```

Expected output:

```text
Email worker started with concurrency: 5
Redis connected
```

---

## Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Configure the frontend `.env` file.

Start the frontend:

```bash
npm run dev
```

---

## Production Build

### Backend

```bash
cd backend
npm run build
```

### Frontend

```bash
cd frontend
npm run build
```

Both backend and frontend builds have been successfully verified during development.

---

## Testing Email Delivery

1. Start PostgreSQL.
2. Start Redis.
3. Start the backend.
4. Start the email worker.
5. Start the frontend.
6. Log in.
7. Add an SMTP sender.
8. Test the SMTP connection.
9. Create a campaign.
10. Add recipients.
11. Start the campaign.
12. Monitor the worker logs.
13. Check the campaign delivery status.

Successful delivery is shown as:

```text
SENT
```

After all jobs finish:

```text
COMPLETED
```

---

## Delivery Tracking

Campaign details show:

- Recipient
- Status
- Attempts
- Sent time
- Error information

Example:

```text
Recipient: recipient@example.com
Status: SENT
Attempts: 1
Sent At: <timestamp>
Error: —
```

---

## API Overview

### Campaigns

```text
POST /api/campaigns
GET  /api/campaigns
GET  /api/campaigns/:id
POST /api/campaigns/:id/start
POST /api/campaigns/:id/cancel
```

### Senders

```text
GET    /api/senders
POST   /api/senders
PUT    /api/senders/:id
DELETE /api/senders/:id
POST   /api/senders/test-connection
POST   /api/senders/:id/test-connection
```

---

## Reliability

The application uses PostgreSQL for persistent application data and Redis/BullMQ for asynchronous email processing.

Email jobs are processed by a dedicated worker rather than directly inside the HTTP request.

Delivery status is persisted so campaign progress can be tracked from the dashboard.

The architecture separates:

```text
API Server
    ↓
Queue
    ↓
Worker
    ↓
SMTP Provider
```

---

## Security

- SMTP passwords are never returned to the frontend.
- `.env` files are excluded from Git.
- SMTP credentials are supplied through environment variables.
- Secrets are not hard-coded.
- Production deployments should use secure TLS configuration.

---

## Assumptions and Trade-offs

- SMTP credentials are provided by the user for the selected sending account.
- Gmail SMTP may require an App Password.
- Redis is used as the BullMQ queue backend.
- PostgreSQL stores persistent application data.
- SMTP submission success does not guarantee final mailbox delivery.
- Ethereal can be used for safe development and testing.
- The application uses asynchronous queue-based email processing.

---

## Future Improvements

- HTML email templates
- Email open and click tracking
- Campaign analytics
- Bounce processing
- CSV recipient import
- Campaign duplication
- Advanced scheduling rules
- Distributed worker deployment
- Production monitoring and metrics

---

## Demo

The demonstration will cover:

1. Login
2. Dashboard
3. SMTP sender configuration
4. SMTP connection testing
5. Campaign creation
6. Recipient configuration
7. Campaign scheduling
8. Worker processing
9. Email delivery
10. Delivery status tracking

---

## License

This project was developed as a technical project demonstrating full-stack development, asynchronous job processing, email scheduling, and SMTP integration.
