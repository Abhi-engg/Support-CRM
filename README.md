# Datastraw Support CRM

A modern, full-stack Customer Support Ticketing System built for high-volume support teams. Designed to handle hundreds of tickets efficiently with a split-pane triage interface, real-time SLA breach detection, and a horizontally scalable backend architecture.

## ✨ Core Features

1. **Create Tickets:** Capture customer details, issues, and priority levels with full form validation and enter-to-next keyboard navigation.
2. **High-Volume Queue:** A highly scannable, color-coded list view designed to eliminate "pogo-sticking" (page reloads) during active triage.
3. **Advanced Search & Filtering:** Case-insensitive, debounced search across names, emails, subjects, and descriptions, alongside status filtering.
4. **Activity Timeline:** A beautiful, chronological timeline that automatically tracks both user notes and system status changes, differentiating them visually with intelligent badging.
5. **Responsive Design:** Intelligently switches from a high-efficiency split-pane on desktop to a native-feeling stacked navigation on mobile devices.

## 🚀 "Stand Out" Bonus Features
To ensure this CRM is genuinely useful for a real support team, the following features were added beyond the core requirements:

* **SLA Breach Detection:** Tickets left `OPEN` for > 24 hours are automatically flagged with a critical red border, allowing agents to instantly triage the most urgent issues.
* **Premium Form UX (Linear-Style):** Completely stripped out standard HTML dropdowns for low-cardinality data, replacing them with color-coded "Radio Chips" for Priority selection to reduce cognitive load and click-paths.
* **Optimistic UI Caching:** Clicking a ticket instantly renders its details with zero latency by lifting cached data from the queue while the backend securely fetches the full activity timeline in the background.
* **Keyboard Navigation:** Agents can move between form inputs using `Enter`, and instantly save ticket updates without taking their hands off the keyboard using `Cmd + Enter` / `Ctrl + Enter`.
* **Debounced API Calls:** The frontend search input waits 300ms after the user stops typing before hitting the backend, drastically reducing database load.
* **Intelligent System Notes:** When an agent changes a ticket's status, the backend actively intercepts the event and embeds a sleek status badge directly into the timeline.

---

## 🛠️ Architecture & Scalability

This application was designed with production-level scalability in mind.

* **Stateless API:** The Node.js/Express backend stores zero session state in local memory. This means it is natively ready to be placed behind a Load Balancer (Nginx, AWS ALB) for infinite horizontal scaling.
* **Serverless Database:** Powered by Neon Postgres, which automatically scales compute resources based on traffic load.
* **Connection Pooling:** Prisma ORM safely multiplexes database queries, ensuring that sudden traffic spikes do not exhaust the Postgres connection limit.

```mermaid
graph TD
    Client[React Frontend / Vite] -->|API Requests| LB[Load Balancer]
    
    subgraph Stateless Backend Cluster
    LB -->|Distributes Load| Node1[Express Server 1]
    LB -->|Distributes Load| Node2[Express Server 2]
    LB -->|Distributes Load| Node3[Express Server 3]
    end

    Node1 -->|Connection Pool| DB[(Neon Serverless Postgres)]
    Node2 -->|Connection Pool| DB
    Node3 -->|Connection Pool| DB
```

---

## 💻 Tech Stack

**Frontend:**
* React 18 (Vite)
* TypeScript
* Tailwind CSS v4 (Modern SaaS UI)
* Lucide React (Icons)
* Date-fns (Relative timestamping)

**Backend:**
* Node.js & Express
* TypeScript
* Prisma ORM (v5)
* PostgreSQL (Neon Serverless DB)

---

## ⚙️ Local Development Setup

### Prerequisites
* Node.js (v18+)
* A PostgreSQL Database URL (Neon recommended)

### 1. Backend Setup
```bash
cd backend
npm install

# Setup Environment Variables
# Create a .env file and add your Neon Postgres URL:
# DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Sync database schema and seed mock data
npx prisma db push
npm run seed

# Start the server (runs on http://localhost:3000)
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start the Vite development server (runs on http://localhost:5174)
npm run dev
```

---
*Designed and built for the Datastraw Technologies Engineering Assessment.*
