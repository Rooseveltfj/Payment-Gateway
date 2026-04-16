# Black Gate Deployment Guide

This guide contains the steps to deploy the Black Gate platform.

## 🛠️ Infrastructure

- **Repository:** [Rooseveltfj/Black-gate](https://github.com/Rooseveltfj/Black-gate)
- **Database:** [Supabase Project nmmjmjcygmublbygnpdy](https://supabase.com/dashboard/project/nmmjmjcygmublbygnpdy)
- **Hosting:** [Vercel](https://vercel.com)

---

## 📂 Step 1: Upload to GitHub

Since Git is not available in my current terminal environment, you need to run these commands in your local terminal:

```bash
# Initialize repository
git init

# Add remote
git remote add origin https://github.com/Rooseveltfj/Black-gate.git

# Prepare code
git add .
git commit -m "chore: setup production environment"

# Push to Main
git push -u origin main
```

> [!CAUTION]
> Ensure you **do not** commit the `.env` file. I have verified that it is included in `.gitignore`.

---

## ⚡ Step 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Import the `Black-gate` repository.
3. In **Environment Variables**, paste the content of the `.env` file I created.
4. Set the **Build Command** if necessary, though Next.js default should work.
5. Click **Deploy**.

---

## 🗄️ Step 3: Supabase & Prisma

1. In Supabase, go to **Settings > Database**.
2. Copy the **Connection String (Transaction Pooler)**.
3. Update the `DATABASE_URL` in your Vercel Environment Variables with this string.
4. To sync the database schema, run locally:
   ```bash
   npx prisma db push
   ```

---

## 📝 Environment Variables Checklist

| Variable | Status | Source |
| :--- | :--- | :--- |
| `NEXTAUTH_SECRET` | ✅ Generated | `.env` |
| `DATABASE_URL` | ⏳ Pending | Supabase Dashboard |
| `RESEND_API_KEY` | ✅ Provided | Resend Dashboard |
| `PAGARME_API_KEY` | ⏳ Pending | Pagar.me Dashboard |
| `UPSTASH_REDIS` | ⏳ Pending | Upstash Dashboard |
