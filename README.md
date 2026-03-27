# FinanceFlow

A modern personal finance tracking application with glassmorphic dark theme design.

## Features

- **Dashboard** - Overview of your financial health with balance, income, expenses
- **Transactions** - Track and manage all your income and expenses
- **Accounts** - Manage bank accounts, credit cards, savings
- **Budgets** - Create and monitor spending budgets by category
- **Goals** - Set and track financial goals (savings, debt payoff, purchases)
- **Analytics** - Visual charts and spending insights
- **AI Assistant** - Get personalized financial advice
- **Settings** - Full customization (currency, language, theme, notifications, security)

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4 (glassmorphic dark theme)
- **State Management**: Zustand
- **Icons**: Lucide React
- **Charts**: Recharts
- **Database**: PostgreSQL with Prisma (optional)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
```

The static build output will be in the `out/` folder, ready for deployment to Vercel, Netlify, or any static hosting.

## Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions to Vercel.

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── page.tsx         # Dashboard
│   ├── accounts/        # Accounts page
│   ├── transactions/    # Transactions page
│   ├── budgets/         # Budgets page
│   ├── goals/           # Goals page
│   ├── analytics/       # Analytics page
│   ├── ai/              # AI Assistant
│   ├── settings/        # Settings page
│   ├── profile/         # Profile page
│   ├── notifications/   # Notifications page
│   ├── admin/           # Admin panel
│   └── api/             # API routes
├── components/       # Reusable components
│   ├── layout/          # Sidebar, Header, BottomNav
│   └── ui/              # UI components (Button, Card, etc.)
├── stores/           # Zustand state management
├── lib/              # Utilities and helpers
└── types/            # TypeScript type definitions
```

## License

MIT