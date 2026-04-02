# Deploying Your Personal Dashboard to Vercel

This guide walks you through getting your Replit Personal Dashboard live on Vercel — including Google Calendar OAuth setup for your new domain.

---

## Prerequisites

- A [Vercel account](https://vercel.com) (free tier is fine)
- A [GitHub account](https://github.com)
- Git installed on your computer

---

## Step 1 — Export Your Code from Replit

1. Open your Replit project
2. Click the **Version Control** tab (the branch icon in the left sidebar)
3. Click **Create a Git Repo** and connect it to GitHub
4. Push your code to a new GitHub repository

Alternatively, download the project as a ZIP from Replit and push it manually:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Step 2 — Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository** and select your GitHub repo
3. Vercel will detect the project. Before clicking Deploy, configure the settings below.

---

## Step 3 — Configure Build Settings

In the Vercel project settings, set the following:

| Setting | Value |
|---|---|
| **Framework Preset** | Vite |
| **Root Directory** | `artifacts/personal-dashboard` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist/public` |
| **Install Command** | `npm install` |

> **Important:** Set the Root Directory to `artifacts/personal-dashboard` so Vercel only builds the dashboard and not the entire monorepo.

---

## Step 4 — Set Environment Variables

In Vercel, go to your project → **Settings → Environment Variables** and add the following:

| Variable | Value |
|---|---|
| `BASE_PATH` | `/` |
| `PORT` | `3000` |
| `VITE_GOOGLE_CLIENT_ID` | `155580146656-ssejc6frnr41r2p8vltg1lf1e7t79kq2.apps.googleusercontent.com` |

Apply these to **Production**, **Preview**, and **Development** environments.

---

## Step 5 — Fix the Monorepo Dependency

The dashboard references a workspace package (`@workspace/api-client-react`) that only exists inside the Replit monorepo. Before deploying, you need to remove that reference.

Open `artifacts/personal-dashboard/package.json` and delete this line from `devDependencies`:

```json
"@workspace/api-client-react": "workspace:*",
```

Also open `artifacts/personal-dashboard/vite.config.ts` and remove the `@replit/vite-plugin-cartographer` and `@replit/vite-plugin-dev-banner` imports — these are Replit-only plugins and will cause the build to fail outside of Replit. The relevant block to remove looks like this:

```ts
// Remove this entire conditional block:
...(process.env.NODE_ENV !== "production" &&
process.env.REPL_ID !== undefined
  ? [
      await import("@replit/vite-plugin-cartographer").then(...),
      await import("@replit/vite-plugin-dev-banner").then(...),
    ]
  : []),
```

Commit and push these changes before deploying.

---

## Step 6 — Deploy

Click **Deploy** in Vercel. The build will run `vite build` inside `artifacts/personal-dashboard` and output to `dist/public`. Your dashboard will be live at a URL like:

```
https://your-project-name.vercel.app
```

---

## Step 7 — Update Google Calendar OAuth

Your Google Calendar integration will not work until you authorize the new Vercel domain. Do the following:

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Navigate to **APIs & Services → Credentials**
3. Click on your OAuth 2.0 Client: `155580146656-ssejc6frnr41r2p8vltg1lf1e7t79kq2`
4. Under **Authorized JavaScript origins**, click **Add URI** and add:
   ```
   https://your-project-name.vercel.app
   ```
5. Click **Save**

Once saved, return to your deployed dashboard and click **Connect Google Calendar** — the popup will now authenticate successfully.

---

## Step 8 — Custom Domain (Optional)

If you want to use your own domain (e.g., `dashboard.yourdomain.com`):

1. In Vercel, go to your project → **Settings → Domains**
2. Add your custom domain and follow the DNS instructions
3. After your domain is live, go back to Google Cloud Console and add it as an additional **Authorized JavaScript origin**:
   ```
   https://dashboard.yourdomain.com
   ```

---

## Environment Variable Reference

| Variable | Required | Description |
|---|---|---|
| `BASE_PATH` | Yes | Set to `/` for Vercel (controls the app's URL base path) |
| `PORT` | Yes | Set to `3000` (Vercel ignores this but the build config requires it) |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Your Google OAuth client ID for Calendar integration |

---

## Troubleshooting

**Build fails with "Cannot find module @workspace/api-client-react"**
→ Remove that line from `package.json` as described in Step 5.

**Build fails with "PORT environment variable is required"**
→ Make sure `PORT=3000` is set in Vercel environment variables.

**Google Calendar popup blocked or fails**
→ Your Vercel domain is not yet in the Authorized JavaScript Origins list in Google Cloud Console. Follow Step 7.

**Blank page after deploy**
→ Check that `BASE_PATH` is set to `/` — an incorrect base path will cause all assets to 404.

**Weather not loading**
→ Weather data comes from `api.weather.gov` which is a public API — no key required. If it fails, it's a temporary outage on their end.
