# FinanceFlow - Deployment Guide

## Quick Deploy to Vercel

### Option 1: One-Click Deploy (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "FinanceFlow app"
   git branch -M main
   git remote add origin https://github.com/your-username/financeflow.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Framework Preset: **Next.js**
   - Click "Deploy"

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

---

## Environment Variables (Optional)

If you want to connect a database later, add these in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=your_postgres_connection_string
```

---

## Current Status

✅ **Static Build** - Ready for hosting  
📁 **Output**: `out/` folder  
🌐 **Hosts**: Vercel, Netlify, Cloudflare Pages, GitHub Pages

---

## For Backend/AI Features Later

To add API routes and database:

1. Remove `output: "export"` from next.config.ts
2. Add Vercel Postgres or another database
3. Create API routes in `src/app/api/`
4. Redeploy

---

## Tech Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS 4
- **State**: Zustand
- **Icons**: Lucide React
- **Charts**: Recharts

---

## Support

For issues: https://github.com/your-username/financeflow/issues