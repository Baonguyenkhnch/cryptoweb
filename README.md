

# CryptoWeb

[![Staging](https://img.shields.io/badge/Staging-Vercel-orange)](https://cryptoweb-git-staging-baonguyenkhnchs-projects.vercel.app)  
[![Production](https://img.shields.io/badge/Production-Vercel-blue)](https://cryptoweb-bl24mmfd5-baonguyenkhnchs-projects.vercel.app)

## Local development

### 1) Configure environment variables

- Copy [./.env.example](.env.example) to `.env.local`.
- Set your backend URL(s):

  - `VITE_BACKEND_URL`: used by most endpoints (register, send/verify magic-link, credit score, user-info, …)
  - `VITE_DEV_URL`: used by SIWE (wallet auth). If you don’t have a separate SIWE base, set it to the same as `VITE_BACKEND_URL`.

Example `.env.local`:

```dotenv
VITE_BACKEND_URL=http://localhost:8080
VITE_DEV_URL=http://localhost:8080
VITE_USE_VITE_PROXY=true
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

### 2) Run frontend

```bash
npm install
npm run dev
```

Frontend default: `http://localhost:5173`

If `VITE_USE_VITE_PROXY=true`, API calls will go to `/api/...` on `localhost:5173` and be proxied to your backend. This is the easiest way to avoid CORS issues.

### 3) Testing email magic-link on local

You have 2 options:

1. **Preferred (full local):** run backend locally and configure backend to generate email links pointing to `http://localhost:5173`.
	- Most backends support something like `FRONTEND_URL` / `APP_URL` / `WEB_URL` for email templates.
	- Make sure backend CORS allows origin `http://localhost:5173`.

2. **If you are using the production backend:**
	- If backend returns `verificationToken` in the `send-magic-link` response, the UI shows a DEV helper button **“Mở magic-link ngay (DEV)”** to open `#/verify?token=...` on localhost.
	- If backend does **not** return the token, you must click the email link and replace the domain with `http://localhost:5173` (keep the same `token`).
