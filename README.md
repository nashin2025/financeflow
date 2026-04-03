# FinanceFlow

A modern personal finance tracking application built with Next.js 16, featuring a glassmorphic dark theme design. Track transactions, manage budgets, set financial goals, analyze spending patterns, and get AI-powered financial insights.

## Features

### Dashboard
- Financial health overview with balance, income, expenses, and savings rate
- Quick action links for common tasks
- Budget progress indicators
- Recent transactions summary
- Active goals snapshot
- AI-powered financial insights

### Transactions
- Add income and expense transactions
- Categorize with 30+ predefined categories
- Search, filter, and sort transactions
- Group by date with expandable sections
- Support for recurring transactions
- Merchant tracking and notes

### Accounts
- Manage multiple account types (checking, savings, credit card, cash, investment, loan, mortgage, crypto)
- Net worth summary (assets vs liabilities)
- Account balance tracking in MVR currency
- Institution grouping

### Budgets
- Create category-based budgets
- Monthly/weekly budget periods
- Progress tracking with visual indicators
- Status alerts (On Track / Near Limit / Over Budget)
- 6-month spending trend charts
- Rollover support

### Goals
- Set financial goals (savings, debt payoff, purchases)
- Track progress with visual progress rings
- Monthly contribution planning
- Projected completion dates
- Milestone tracking
- Add money to goals

### Analytics
- **Spending Tab**: Donut chart by category, 6-month trend, top merchants
- **Income Tab**: Income sources breakdown, monthly averages, trends
- **Net Worth Tab**: Net worth history, asset breakdown by account

### AI Assistant
- Financial health score dashboard (savings, budget, debt, emergency, consistency)
- Interactive chat for financial advice
- Quick question suggestions
- AI insights panel with warnings, tips, and goal status

### Settings
- **General**: Currency, language, theme, week start, budget period
- **Notifications**: Push, email, budget alerts, bill reminders, AI insights
- **Security**: Password change, 2FA, biometric lock, login history
- **Data**: Export/import CSV, connected accounts, delete account
- **Support**: Help center, contact, privacy policy, terms

### Profile
- User avatar with initials
- Plan badge (Free/Premium)
- Quick stats and achievements
- Account summary
- Edit profile modal

### Notifications
- Budget alerts, goal milestones, anomaly detection
- AI insights and bill reminders
- System notifications
- Filter and manage notifications

### Admin Panel
- User management dashboard
- Toggle premium status for users
- Protected with admin secret authentication

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS 4 |
| **State Management** | Zustand |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Database ORM** | Prisma |
| **Database** | PostgreSQL |
| **Authentication** | bcryptjs |
| **Date Formatting** | date-fns |
| **Language** | TypeScript |

## Project Structure

```
financeflow/
├── prisma/
│   ├── schema.prisma          # Database schema (User, Account, Transaction, Category, Budget, Goal)
│   └── dev.db                 # SQLite dev database
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # Dashboard (home)
│   │   ├── layout.tsx         # Root layout with fonts and metadata
│   │   ├── globals.css        # Global styles, CSS variables, animations
│   │   ├── login/             # Login page
│   │   ├── signup/            # Registration page
│   │   ├── profile/           # User profile
│   │   ├── notifications/     # Notifications center
│   │   ├── goals/             # Financial goals
│   │   ├── transactions/      # Transaction list
│   │   ├── add/               # Add new transaction
│   │   ├── analytics/         # Analytics and charts
│   │   ├── budgets/           # Budget management
│   │   ├── accounts/          # Account management
│   │   ├── settings/          # Settings page
│   │   ├── ai/                # AI Assistant
│   │   ├── admin/             # Admin panel
│   │   └── api/               # API Routes
│   │       ├── auth/
│   │       │   ├── login/     # POST /api/auth/login
│   │       │   └── register/  # POST /api/auth/register
│   │       └── users/
│   │           ├── route.ts   # GET /api/users (admin)
│   │           └── [id]/      # PUT/DELETE /api/users/[id] (admin)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx         # Desktop sidebar navigation
│   │   │   ├── bottom-nav.tsx      # Mobile bottom navigation
│   │   │   ├── header.tsx          # Top header bar
│   │   │   └── dashboard-layout.tsx # Layout wrapper
│   │   └── ui/
│   │       ├── button.tsx     # Button (primary, secondary, ghost, danger)
│   │       ├── card.tsx       # Card with sub-components
│   │       ├── input.tsx      # Form input with icons
│   │       ├── select.tsx     # Native select wrapper
│   │       ├── dropdown.tsx   # Custom dropdown
│   │       ├── badge.tsx      # Status badges
│   │       ├── progress.tsx   # Progress bar and ring
│   │       ├── skeleton.tsx   # Loading skeletons
│   │       ├── modal.tsx      # Modal and bottom sheet
│   │       └── index.ts       # Barrel exports
│   ├── stores/
│   │   └── app-store.ts       # Zustand global state store
│   ├── lib/
│   │   ├── utils.ts           # Utility functions (formatCurrency, formatDate, etc.)
│   │   └── prisma.ts          # Prisma client singleton
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── hooks/                 # Custom hooks (empty)
├── .env.example               # Environment variable template
├── .gitignore                 # Git ignore rules
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and scripts
├── postcss.config.mjs         # PostCSS configuration
├── tsconfig.json              # TypeScript configuration
├── eslint.config.mjs          # ESLint configuration
├── vercel.json                # Vercel deployment config
└── DEPLOY.md                  # Deployment guide
```

## Database Schema

The application uses Prisma with PostgreSQL. Key models:

- **User** - Authentication, premium/admin flags
- **Account** - Bank accounts, credit cards, savings with balance tracking
- **Transaction** - Income/expenses with categories, tags, recurring support
- **Category** - Custom and system categories with icons and colors
- **Budget** - Category budgets with period, rollover, and alerts
- **Goal** - Financial goals with target amounts and progress tracking

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL (optional, for database features)

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Generate Prisma client and build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/financeflow
```

## Design

- **Theme**: Glassmorphic dark mode
- **Fonts**: Inter (UI), JetBrains Mono (code/numbers), Space Grotesk (headings)
- **Currency**: MVR (Maldivian Rufiyaa) by default
- **Animations**: CSS keyframes for fade, slide, pulse, shimmer effects

## Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

### Quick Deploy

1. Push to GitHub
2. Connect to Vercel
3. Add `DATABASE_URL` environment variable
4. Deploy

## License

MIT
