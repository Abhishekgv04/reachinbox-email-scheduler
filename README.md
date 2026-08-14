# ReachInbox Email Scheduler

A full-stack email scheduling system built for the ReachInbox SDE Intern assignment.

The application allows users to create email campaigns, upload recipient lists, schedule emails for a future time, and process email delivery asynchronously using BullMQ and Redis.

---

## Features

### Authentication
- Google OAuth authentication
- User profile with name, email and avatar
- Logout
- User-specific campaigns and senders

### Email Campaigns
- Create campaigns
- Add email subject and body
- Add recipients manually
- Upload CSV/TXT recipient files
- Automatically detect valid email addresses
- Remove duplicate recipients
- Configure start time
- Configure delay between emails
- Configure hourly sending limit
- Start campaigns
- Cancel campaigns
- Track recipient-level delivery status

### Email Scheduling
- BullMQ delayed jobs
- Redis-backed persistent queue
- Future scheduled emails survive backend restarts
- No cron jobs are used

### Email Processing
- Dedicated BullMQ worker
- Configurable worker concurrency
- Nodemailer SMTP delivery
- Ethereal Email support
- Retry handling
- Failed email tracking
- Attempt tracking
- Idempotency protection

### Rate Limiting
- Configurable hourly email limit
- Configurable minimum delay between emails
- Jobs are not permanently dropped when limits are reached
- Redis/BullMQ based asynchronous processing

### Dashboard
- Total campaigns
- Total email jobs
- Successfully sent emails
- Failed emails
- Recent campaigns
- Campaign progress
- Scheduled and completed campaign status

---

# Technology Stack

## Frontend

- React
- Vite
- JavaScript / JSX
- Tailwind CSS
- Axios
- Lucide React

## Backend

- Node.js
- TypeScript
- Express.js
- Prisma ORM
- Nodemailer

## Database

- PostgreSQL
- Prisma Migrations

## Queue

- Redis
- BullMQ
- Dedicated Worker

## SMTP

- Ethereal Email
- Nodemailer

## Development

- Git
- GitHub
- VS Code
- Docker / Docker Compose

---

# Architecture

```text
                    React Frontend
                         |
                         | REST API
                         v
                 Express + TypeScript
                         |
             +-----------+-----------+
             |                       |
             v                       v
        PostgreSQL                 Redis
        + Prisma                  + BullMQ
                                     |
                                     v
                              Email Worker
                                     |
                                     v
                                Nodemailer
                                     |
                                     v
                              Ethereal SMTP
                                     |
                                     v
                                Recipient