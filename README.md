# BIT TECH CONNECT — Bearys Institute of Technology

**Tagline:** ENTER THE FUTURE.  
**Identity:** Nature × Technology × Futuristic Cyber World  
**Institution:** Bearys Institute of Technology, Mangalore, Karnataka, India

---

## Architecture Overview

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Three.js (WebGL particle field, procedural digital cyber-trees, animated network connections), GSAP + ScrollTrigger, Motion, Lucide Icons.
- **Backend:** Node.js + Express (`server.ts`, `backend/`), Helmet security headers, CORS allowlist, express-rate-limit, Zod input validation, Multer image upload validation, SEO `/sitemap.xml` & `/robots.txt`.
- **Database, Auth & Storage:** PostgreSQL + Row Level Security (RLS) + Single-Admin Supabase Auth + Supabase Storage (`database/migrations/001_initial_schema.sql`).
  - When Supabase environment variables are not yet configured, public read endpoints return empty arrays (zero fabricated data) and public Contact / Community submission forms safely store pending entries in a local SQLite database (`data/bit_tech_connect_local.db`).
  - `/admin` enforces real server-side Supabase Auth + single `ADMIN_EMAIL` verification (zero simulated login bypass).

---

## Local Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```env
   PORT=3000
   APP_URL=http://localhost:3000
   ALLOWED_ORIGINS=http://localhost:3000
   SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
   SUPABASE_STORAGE_BUCKET=bit-tech-media
   ADMIN_EMAIL=your-single-admin-email@example.com
   ```

3. **Run PostgreSQL Migration in Supabase:**
   - Open your Supabase project → **SQL Editor**.
   - Paste and execute `database/migrations/001_initial_schema.sql`.
   - Create **exactly one** Admin user in **Authentication → Users** matching `ADMIN_EMAIL`.
   - Create a public Storage bucket named `bit-tech-media` (or the backend auto-creates it on first upload).

4. **Start the full-stack server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` for the public website, or navigate manually to `http://localhost:3000/admin` for the private single-admin console.

---

## Production Deployment

1. **Build frontend bundle:**
   ```bash
   npm run build
   ```
2. **Start production Node.js server:**
   ```bash
   NODE_ENV=production npm start
   ```
3. **Hosting:**
   - Deploy Node.js + Express (`server.ts` + `dist/`) to Cloud Run, Render, Railway, or Fly.io with all environment variables configured in the host's secret manager.
   - Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code.
