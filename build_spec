# MBA Recruiting Tracker — Product & Engineering Build Specification

## 1. Product Overview

### Purpose

Build a single-user web application (PWA-ready) that helps an MBA student manage the full recruiting process across multiple companies, roles, deadlines, networking contacts, and applications.

This product acts as a personal **Recruiting OS** combining:

* Applicant tracking system (ATS)
* Task/checklist manager
* Calendar/deadline manager
* Personal CRM for networking
* Analytics dashboard

Primary use case: one user managing all recruiting-related workflows from one system.

---

# 2. Core Product Features

## Feature 1: Company + Role Tracker

User can:

* create companies manually
* add multiple roles per company
* assign industry/function tags
* assign recruiting stage
* track application status
* archive opportunities

Example stages (editable):

* Targeted
* Networking
* Applied
* Interview 1
* Interview 2
* Final Round
* Offer
* Closed

---

## Feature 2: Dynamic Checklist Engine

Each role automatically gets a default checklist template.

Example checklist:

* Resume tailored
* Cover letter
* Networking outreach complete
* Application submitted
* Technical prep
* Behavioral prep
* Thank-you email

Requirements:

* auto-generated on role creation
* fully editable
* due dates per task
* completion tracking
* overdue highlighting

---

## Feature 3: Calendar / Timeline

Two views:

### Global calendar

Shows all:

* deadlines
* interviews
* reminders
* follow-ups
* checklist due dates

### Opportunity calendar

Filter by company + role.

Requirements:

* month/week/day views
* drag/drop rescheduling
* internal calendar always available
* optional Google Calendar sync

---

## Feature 4: Networking CRM

Track people and conversations.

Fields:

* name
* title
* company
* email
* LinkedIn URL
* notes
* last contacted
* next follow-up date
* relationship strength (1–5)

Capabilities:

* log calls/emails/coffee chats
* reminder generation
* follow-up queue

---

## Feature 5: Due Outs Dashboard

Dedicated page showing:

* overdue items
* due today
* due this week
* grouped by company/role

Clickable drill-down to role detail.

---

## Feature 6: Analytics Dashboard

Metrics:

* roles targeted
* applications submitted
* interviews completed
* networking calls completed
* overdue tasks
* response rate
* funnel conversion by stage

---

# 3. Technical Stack

## Frontend

* Next.js (App Router)
* TypeScript
* Tailwind
* shadcn/ui
* TanStack Query

## Backend

* Next.js Route Handlers
* Server Actions where appropriate

## Database

* Neon Postgres
* Neon Serverless Driver
* Neon Auth (beta)

## ORM

* Drizzle ORM

## Hosting

* Vercel

## Email

* Resend

## Background Jobs

* Inngest

## Calendar UI

* FullCalendar

## PWA

* next-pwa

## Validation

* Zod

---

# 4. System Architecture

```text
Browser/PWA
   |
Next.js App (Vercel)
   |
   |-- UI Routes
   |-- API Routes
   |-- Server Actions
   |
   +--> Neon Auth
   +--> Neon Postgres
   +--> Resend
   +--> Google Calendar API (optional)
   +--> Inngest scheduled jobs
```

---

# 5. Recommended Repo Structure

```text
mba-recruiting-tracker/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── dashboard/
│       │   ├── companies/
│       │   ├── roles/
│       │   ├── calendar/
│       │   ├── crm/
│       │   ├── tasks/
│       │   ├── settings/
│       │   ├── api/
│       │   └── layout.tsx
│       ├── components/
│       ├── lib/
│       └── public/
│
├── packages/
│   ├── db/
│   │   ├── schema/
│   │   ├── migrations/
│   │   └── index.ts
│   ├── ui/
│   ├── types/
│   └── utils/
│
├── docs/
├── .env.example
├── turbo.json
└── package.json
```

Even though this is single-app, use monorepo structure for future internal tools alignment.

---

# 6. Database Schema

## users

```sql
id
email
name
created_at
```

---

## companies

```sql
id
name
industry
notes
created_at
```

---

## roles

```sql
id
company_id
title
location
job_url
status
priority
application_deadline
notes
created_at
```

---

## role_checklists

```sql
id
role_id
template_name
```

---

## checklist_items

```sql
id
checklist_id
title
description
due_date
completed
completed_at
sort_order
```

---

## contacts

```sql
id
company_id
name
title
email
linkedin_url
relationship_strength
notes
last_contacted
next_followup
```

---

## interactions

```sql
id
contact_id
type
notes
interaction_date
next_followup
```

---

## events

```sql
id
role_id
title
event_type
start_at
end_at
external_calendar_id
```

---

## reminders

```sql
id
source_type
source_id
send_at
sent
```

---

## settings

```sql
id
google_connected
google_refresh_token
notification_preferences
```

---

# 7. Key Pages

## Dashboard

Shows:

* KPI cards
* due outs
* recent activity
* upcoming deadlines

---

## Companies Page

Table:

* company
* role count
* active roles
* status summary

Click -> company detail.

---

## Role Detail Page

Contains:

* role info
* checklist
* contacts
* timeline
* notes

Primary workflow page.

---

## Calendar Page

Uses FullCalendar.

Filters:

* company
* role
* event type

---

## CRM Page

Pipeline view of contacts.

Sections:

* needs follow-up
* upcoming follow-ups
* recently contacted

---

## Due Outs Page

Single source of truth for all pending tasks.

---

## Settings Page

* Neon auth settings
* Google calendar connect/disconnect
* email preferences
* default checklist templates

---

# 8. API Endpoints

```text
/api/companies
/api/roles
/api/checklists
/api/tasks
/api/contacts
/api/interactions
/api/events
/api/reminders
/api/google/connect
/api/google/callback
```

REST is sufficient.

---

# 9. Google Calendar Integration

Optional feature.

If enabled:

1. user OAuths with Google
2. store refresh token encrypted
3. sync internal events outbound
4. store external_calendar_id

Do not make Google the system of record.
Internal DB remains source of truth.

---

# 10. Notifications

## In-app

Notification center dropdown.

## Email (Resend)

Daily cron via Inngest:

* due today
* overdue
* follow-ups

Template examples:

* morning digest
* overdue warning

---

# 11. Background Jobs (Inngest)

Jobs:

1. Daily reminder email
2. overdue task recalculation
3. Google calendar sync
4. stale contact detection

Schedule:

```text
0 7 * * *
```

Daily at 7am local.

---

# 12. PWA Requirements

Must support:

* install to home screen
* responsive mobile layouts
* offline shell caching
* app icons
* manifest
* service worker

Use:

* next-pwa

---

# 13. Security

* Neon auth session protection
* server-side authorization checks
* encrypted tokens
* environment variables in Vercel
* no secrets client-side

---

# 14. Environment Variables

```env
DATABASE_URL=
NEON_AUTH_URL=
NEON_API_KEY=
RESEND_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_APP_URL=
```

---

# 15. MVP Delivery Order

## Phase 1

Core:

* auth
* companies
* roles
* checklists
* due outs

---

## Phase 2

* calendar
* CRM
* reminders

---

## Phase 3

* Google calendar sync
* analytics dashboard

---

## Phase 4

Future:

* email ingestion
* job board scraping
* AI suggestions
* AI email drafting
* JD parsing

---

# 16. Definition of Done

MVP complete when user can:

1. add company
2. add role
3. auto-generate checklist
4. track tasks
5. log contacts
6. schedule follow-up
7. view calendar
8. receive reminder emails
9. install as PWA
10. deploy on Vercel successfully

---

# Final Recommendation

Build this as a clean internal tool first.
Optimize for speed and simplicity.
Avoid premature AI features.
Ship MVP in 2–3 weeks, then iterate.
