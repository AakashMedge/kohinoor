# Kohinoor Jewellers - Digital Billing SaaS

A modern, fast, and robust digital billing application tailored exactly for Kohinoor Jewellers. Built with the cutting edge **Next.js 16 (App Router)** and **PostgreSQL** database.

## 🚀 Features
- **Dashboard Overview:** Track daily and monthly sales metrics.
- **Smart Invoicing Engine:** Add HSN, HUID, advanced tax computation, and live Net/Gross Weight mapping.
- **Split Payment Workflow:** Accepts multi-channel partial payments (Advance, Cards, Cash, UPI Digital) simulating real-world jewellery store cash-counter dynamics.
- **Live PDF Rendering:** 100% accurate, fixed-border print media HTML templates guaranteed to drop into an A4 print structure natively from the browser. 
- **Full History Ledger:** Dedicated Reports tab to trace any past record with Search and Date filters.

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router, Server Actions, React 19)
- **Database:** PostgreSQL (Neon Serverless DB) + `postgres.js`
- **Styling:** Vanilla CSS 3 with CSS Grid Architecture & Print Media Queries

## 📦 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/AakashMedge/kohinoor.git
```

2. Install the dependencies:
```bash
npm install
```

3. Setup your environment variable:
Create a `.env.local` file in the root of the project to map to the Neon database:
```bash
DATABASE_URL="your-postgreSQL-url-here"
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
