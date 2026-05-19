# Ganesh Printers Delivery Billing Management PWA

A complete, production-ready, mobile-first billing management web application designed for a delivery business. The system digitizes the traditional paper notebook tracking workflow into a fast, simple mobile application to add, manage, and track invoices and trigger real-time backups to Google Sheets, with instant client-side PDF statements.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Core server/client framework |
| **Language** | TypeScript (Strict mode) | Strict type-safety across client and APIs |
| **Database** | Supabase (PostgreSQL) | Primary source of truth with Row-Level Security |
| **State & UI** | React Query v5 & Tailwind CSS | Dynamic caching, Optimistic UI, and custom HSL theme |
| **Spreadsheets** | Google Sheets API (`googleapis`) | Non-blocking secondary real-time backups |
| **Statements** | jsPDF & jsPDF-AutoTable | Fast client-side dynamic invoice statement compiler |
| **PWA** | next-pwa | Offline caching, standalone installation support |

---

## 🚀 Key Features

* **Mobile-First UX**: Premium glassmorphism layout tailored for notched screens, featuring custom bottom sheets for all workflows (no rigid tables on mobile screens).
* **Vibrant Tailored Colors**: A professional green/amber theme representing collection statuses (Paid vs Outstanding).
* **Snappy Optimistic UI**: Changes to bill checklists reflect instantly in the user interface prior to network confirmation.
* **Instant Client-Side PDF Compiler**: Compile A4-ready outstanding bills reports with dynamic details (Indian currency formatted) in one click without touching the server.
* **Non-Blocking Real-Time Backups**: Server operations trigger background synchronizations to Google Sheets spreadsheets, silently logging sync statuses.
* **Standalone PWA Installation**: Add the application directly to the homescreen of iOS or Android phones.

---

## 🛠️ Step-by-Step Local Development Setup

### 1. Pre-requisites
Make sure you have [Node.js (v18+)](https://nodejs.org) and NPM installed on your local machine.

### 2. Install Project Dependencies
Run the following command in your terminal from the root workspace directory to install dependencies:
```bash
npm install
```

### 3. Setup Environment Variables
Create a file named `.env.local` in the root directory and define the following variables:
```env
# SUPABASE SETTINGS
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-client-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-secure-service-role-key

# GOOGLE SHEETS API SETTINGS
GOOGLE_SERVICE_ACCOUNT_EMAIL=billing-sheets-sync@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC... \n-----END PRIVATE KEY-----"
GOOGLE_SHEET_ID=your-google-spreadsheet-id

# AUTH CONFIGURATION
NEXTAUTH_SECRET=a-very-long-secret-key-of-your-choice
NEXTAUTH_URL=http://localhost:3000
```

### 4. Database Schema Setup (Supabase)
Create a new Supabase project, navigate to the **SQL Editor**, paste the contents of `supabase/migrations/001_initial_schema.sql` and execute the query to set up tables, indexes, and Row-Level Security (RLS) policies.

### 5. Google Sheets API Configuration
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project, enable the **Google Sheets API**.
3. Create a **Service Account** and generate a JSON private key.
4. Copy the service account's email and private key to your `.env.local` file.
5. Create a Google Spreadsheet with four tabs (exact casing): `Places`, `Pending Bills`, `Completed Bills`, `Activity Logs`.
6. Share your spreadsheet with your Service Account's email address giving it **Editor** permissions.

### 6. Run Dev Server
Launch your local environment by running:
```bash
npm run dev
```
Open your browser to `http://localhost:3000` to interact with the application.

---

## 🔑 Default Single-User Credentials
To enter the owner's billing dashboard gateway, use the following credentials on the login screen:
* **Email**: `admin@ganesh.com`
* **Security Password**: `ganesh123`

---

## 📱 How to Install PWA on Mobile Devices

### 🌐 Android (Chrome / Samsung Internet)
1. Open the hosted URL in Google Chrome on your phone.
2. Tap the **three-dot menu icon** in the top right.
3. Tap **Add to Home screen** (or **Install app**).
4. Confirm by tapping **Add**.

### 🍏 iOS (Safari)
1. Open the hosted URL in Safari on your iPhone.
2. Tap the **Share button** (the square icon with a pointing-up arrow) at the bottom.
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add** in the top-right corner.
