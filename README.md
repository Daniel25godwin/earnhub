# EarnHub

Task-and-reward earning platform. React + Vite frontend, Firebase (Auth, Firestore, Storage, Hosting) backend.

## ⚠️ Testing-phase architecture note

This build currently runs **entirely client-side against Firestore** — no Cloud Functions, no
backend server. This was a deliberate choice to avoid the Firebase Blaze plan while testing.
The trade-off: **wallet balances and other sensitive data are directly writable by whoever's
signed in** (see the warning banner at the top of `firestore.rules`). This is fine for local
testing but is not safe once real money is involved — before onboarding real users, sensitive
writes need to move behind a real backend authority (Cloud Functions on Blaze, or a hosted
server) and the rules tightened back down. A reference implementation of the Cloud Functions
version of the auth logic is kept in `/functions` for that future migration.

## Prerequisites

- Node.js 20+
- A Firebase project (create one at https://console.firebase.google.com if you haven't)
- Firebase CLI: `npm install -g firebase-tools`

## 1. Link this project to your Firebase project

```bash
firebase login
firebase use --add
# Select your Firebase project, and set the alias to "default"
```

## 2. Enable required Firebase services

In the Firebase Console for your project, enable:
- **Authentication** → Sign-in method → Email/Password, and Google
- **Firestore Database** → create in production mode (rules are already written)
- **Storage** → get started (rules are already written)

## 3. Configure environment variables

Copy `.env.example` to `.env.local` (on Windows: `copy .env.example .env.local`) and fill in
the values from **Project Settings → General → Your apps → SDK setup and configuration**.

## 4. Install dependencies

```bash
npm install
```

## 5. Run locally

```bash
npm run dev
```

Visit `http://localhost:5173`.

## 6. Deploy

```bash
npm run build
firebase deploy --only hosting,firestore:rules,firestore:indexes,storage
```

(Note: `--only` deliberately excludes `functions` — nothing there is used right now.)

## Bootstrapping your own admin account

Since there's no Cloud Function to assign roles right now, set your own admin custom claim
with a one-off local script using the Firebase Admin SDK and your service account key
(Project Settings → Service accounts → Generate new private key). This is a plain Node script
run on your machine — it does not require the Blaze plan.

## Project structure

```
/src            React frontend
/functions      Cloud Functions reference implementation (not currently deployed/used)
firestore.rules       Firestore Security Rules (see the testing-phase warning banner)
firestore.indexes.json Composite indexes
storage.rules          Storage Security Rules
firebase.json           Firebase project config
```

## Verified

- `npm run build` — compiles cleanly
- `npm run lint` — no errors

