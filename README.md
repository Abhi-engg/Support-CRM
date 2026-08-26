# Datastraw Support CRM

A full-stack customer support ticketing system built for the Datastraw Technologies hiring assignment. Designed with an intentional "Thermal Triage" brutalist aesthetic to stand out, optimizing for high-density information scanning and strict visual structure.

## Features (Core)
* **Create Ticket**: Open new support records with auto-generated sequential IDs (e.g., `TKT-001`).
* **List Tickets**: A fast, filterable queue layout.
* **Search & Filter**: Real-time debounced search across names, emails, and subjects, with status filtering.
* **View & Update**: A detailed right-pane view with a chronological Activity Log for notes and status updates.

## Features (Stand-Out)
* **Priority Levels**: Triage tickets by `LOW`, `MEDIUM`, `HIGH`, or `URGENT` priority. 
* **SLA Overdue Flagging**: Tickets that remain `OPEN` for more than 24 hours receive an aggressive visual stamp (`SLA BREACH`) to immediately draw agent attention.

## Tech Stack
* **Frontend**: React, TypeScript, Vite, Tailwind CSS v4, Lucide Icons.
* **Backend**: Node.js, Express, TypeScript.
* **Database**: PostgreSQL (Hosted on Neon) + Prisma ORM.

## Setup Instructions

### 1. Database Configuration
This project uses a hosted Neon PostgreSQL database, meaning no local Docker or Postgres installation is required.
1. Create a `.env` file in the `backend/` directory (you can copy `.env.example`).
2. Add your Neon connection string: `DATABASE_URL="postgresql://user:pass@host/neondb?sslmode=require"`

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma migrate dev --name init  # Syncs schema to Neon
npm run dev                         # Starts server on localhost:3000
```

### 3. Frontend Setup (in a new terminal)
```bash
cd frontend
npm install
npm run dev                         # Starts app on localhost:5174
```

### Optional: Seed Mock Data
To populate the database with realistic sample tickets (including an SLA Breach ticket to test the standout feature):
```bash
cd backend
npx ts-node seed.ts
```

## Design Notes ("Thermal Triage")
The UI deliberately avoids generic SaaS templates. Support agents look at queues all day, so the aesthetic is grounded in physical triage: thermal paper receipts, ink stamps, and high-contrast 1px borders. `Inter` is reserved for human-authored content, while `Space Mono` is strictly applied to system-generated metadata (IDs, Timestamps, Priorities). The SLA Overdue flag is implemented as a physical red "stamp" that purposefully breaks the grid alignment to communicate urgency.