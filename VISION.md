# Signal House Dashboard: Vision & Blueprint

This document serves as the master blueprint for the Signal House Dashboard. If the codebase ever breaks or needs to be rebuilt, this file contains the core philosophy, feature set, and aesthetic guidelines that define the project.

## 🎯 Core Vision
The Signal House Dashboard is a highly personal, relentlessly focused "Mastery Field Manual" designed to track daily progress. 
It is built with an **ADHD-friendly workflow** in mind: breaking massive, intimidating projects down into high-precision, bite-sized tasks that can be executed daily without overwhelming the user.

## 🎨 Look & Feel (Aesthetics)
The application must feel like a premium, state-of-the-art hacker terminal mixed with modern web design.
- **Theme:** Deep Dark Mode by default.
- **Accents:** Neon/Cyberpunk accents (specifically neon green for checkmarks and progress indicators) that pop against the dark background, but remain legible.
- **UI Elements:** 
  - **Glassmorphism:** The login panel and modal windows use frosted glass effects (blur backdrops, semi-transparent backgrounds, subtle drop shadows).
  - **Typography:** Clean, modern sans-serif fonts (like Inter or Roboto) to maintain a highly technical but readable look.
- **Interactions:** Dynamic micro-animations on hover states (buttons lifting, checkmarks glowing) so the interface feels alive and responsive.

## ⚙️ Key Features

### 1. The Mastery Roadmap (Bite-Sized Execution)
- The core UI is a hierarchical checklist representing overarching "Projects", broken down into "Subprojects", which are further broken down into individual "Tasks" and "Tests".
- **Focus Mode:** Future tasks and projects that are not immediately relevant should be collapsible or hidden to prevent feeling overwhelmed.

### 2. Cloud Sync (Supabase)
- The app must track progress seamlessly across any device. 
- It uses **Supabase** (PostgreSQL) to store the state of every single checkbox. 
- The schema (`user_progress`) maps a User ID to a JSON object of completed tasks. 
- *Fallback Mechanism:* If the cloud database is ever unreachable, the app degrades gracefully and saves progress to local `localStorage`.

### 3. Single-Player Authentication (Google OAuth)
- The dashboard is completely private. No one else is allowed in.
- It uses a 1-click **Sign in with Google** flow.
- *Security Lock:* This is enforced at the Google Cloud level by setting the OAuth Consent Screen to "External" and only adding the user's specific email address to the "Test users" list.

### 4. Hosting & Infrastructure (Cloudflare)
- Hosted globally on **Cloudflare** (via the Workers/Pages unified platform).
- The build pipeline uses `vinext` and Vite. 
- *Critical Build Override:* To ensure the raw `import.meta.env` variables (like Supabase API keys) are readable by the browser, the `scripts/prepare-static.mjs` file manually intercepts `app.js` during the Cloudflare build process, injects the Cloudflare Build Variables, and writes the static assets directly to the root domain.

## 🛠 Tech Stack Summary
- **Frontend:** HTML, Vanilla CSS, Vanilla JS (No bulky frameworks for the core logic, ensuring lightning-fast load times).
- **Backend/DB:** Supabase (Postgres & Auth).
- **Hosting:** Cloudflare.
- **Bundler:** Vite (customized via `prepare-static.mjs`).
