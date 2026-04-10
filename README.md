# FinanceFlow

> Your Money. Your Future. Crystal Clear.

A modern personal finance tracking application built with Next.js 16, featuring a glassmorphic dark theme design. Track transactions, manage budgets, set financial goals, analyze spending patterns, and get AI-powered financial insights.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38BDF8)
![License](https://img.shields.io/badge/license-MIT-green)

---

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

---

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js | 16.2.1 |
| **UI Library** | React | 19.2.4 |
| **Language** | TypeScript | ^5 |
| **Styling** | Tailwind CSS | ^4 |
| **State Management** | Zustand | ^5.0.12 |
| **Icons** | Lucide React | ^1.7.0 |
| **Charts** | Recharts | ^3.8.1 |
| **Database ORM** | Prisma Client | ^6.19.2 |
| **Database** | PostgreSQL | — |
| **Authentication** | bcryptjs | ^3.0.3 |
| **JWT** | jose | ^6.2.2 |
| **Date Formatting** | date-fns | ^4.1.0 |
| **CSS Utilities** | clsx + tailwind-merge | — |
| **Linting** | ESLint | ^9 |

---

## Project Structure

```
financeflow/
├── .env.example               # Environment variable template
├── .gitignore                 # Git ignore rules
├── eslint.config.mjs          # ESLint configuration
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and scripts
├── package-lock.json          # Lock file
├── postcss.config.mjs         # PostCSS with @tailwindcss/postcss
├── tsconfig.json              # TypeScript configuration
├── vercel.json                # Vercel deployment config
├── DEPLOY.md                  # Deployment guide
├── prisma/
│   ├── schema.prisma          # Database schema (7 models, 6 enums)
│   └── dev.db                 # SQLite dev database
├── public/                    # Static assets (favicon, icons)
└── src/
    ├── middleware.ts          # JWT auth middleware for API routes
    ├── app/                   # Next.js App Router pages
    │   ├── favicon.ico
    │   ├── globals.css        # Design tokens, animations, Tailwind import
    │   ├── layout.tsx         # Root layout with fonts, metadata, AuthGuard
    │   ├── page.tsx           # Dashboard (home)
    │   ├── login/
    │   │   └── page.tsx       # Login page
    │   ├── signup/
    │   │   └── page.tsx       # Registration page
    │   ├── profile/
    │   │   └── page.tsx       # User profile
    │   ├── notifications/
    │   │   └── page.tsx       # Notifications center
    │   ├── goals/
    │   │   └── page.tsx       # Financial goals list
    │   ├── transactions/
    │   │   └── page.tsx       # Transaction list with search/filter
    │   ├── add/
    │   │   └── page.tsx       # Add new transaction form
    │   ├── analytics/
    │   │   └── page.tsx       # Analytics with charts (spending/income/net worth)
    │   ├── budgets/
    │   │   └── page.tsx       # Budget management list
    │   ├── accounts/
    │   │   └── page.tsx       # Account management
    │   ├── settings/
    │   │   └── page.tsx       # Settings (general, security, data, support)
    │   ├── ai/
    │   │   └── page.tsx       # AI Assistant chat
    │   ├── admin/
    │   │   └── page.tsx       # Admin panel
    │   ├── add-account/
    │   │   └── page.tsx       # Add account form
    │   ├── add-budget/
    │   │   └── page.tsx       # Add budget form
    │   ├── add-goal/
    │   │   └── page.tsx       # Add goal form
    │   └── api/               # API Routes
    │       ├── auth/
    │       │   ├── login/route.ts       # POST - Login
    │       │   ├── register/route.ts    # POST - Register
    │       │   ├── logout/route.ts      # POST - Logout
    │       │   ├── refresh/route.ts     # POST - Refresh token
    │       │   ├── me/route.ts          # GET - Current user
    │       │   ├── forgot-password/route.ts  # POST - Request reset
    │       │   ├── reset-password/route.ts   # POST - Reset password
    │       │   └── change-password/route.ts  # POST - Change password
    │       ├── transactions/route.ts    # GET, POST
    │       ├── accounts/route.ts        # GET, POST
    │       ├── budgets/route.ts         # GET, POST
    │       ├── goals/route.ts           # GET, POST
    │       ├── categories/route.ts      # GET, POST
    │       ├── notifications/route.ts   # GET, POST
    │       ├── me/route.ts              # GET, PUT
    │       └── users/
    │           ├── route.ts             # GET - List users (admin)
    │           └── [id]/route.ts        # PUT, DELETE (admin)
    ├── components/
    │   ├── premium-lock.tsx             # Premium feature gating overlay
    │   ├── auth/
    │   │   └── auth-guard.tsx           # Root-level auth check
    │   ├── layout/
    │   │   ├── sidebar.tsx              # Desktop sidebar navigation
    │   │   ├── bottom-nav.tsx           # Mobile bottom nav + FAB
    │   │   ├── header.tsx               # Sticky header with search/notifications
    │   │   └── dashboard-layout.tsx     # Layout wrapper
    │   └── ui/
    │       ├── button.tsx               # Button (primary/secondary/ghost/danger)
    │       ├── card.tsx                 # Card (glass/elevated variants)
    │       ├── input.tsx                # Input with icon support
    │       ├── select.tsx               # Select dropdown
    │       ├── dropdown.tsx             # Custom dropdown
    │       ├── badge.tsx                # Status badges
    │       ├── progress.tsx             # Progress bar + ring
    │       ├── skeleton.tsx             # Loading skeletons
    │       ├── modal.tsx                # Modal dialog + bottom sheet
    │       └── index.ts                 # Barrel exports
    ├── stores/
    │   └── app-store.ts                 # Zustand store with localStorage
    ├── lib/
    │   ├── auth.ts                      # JWT creation/verification, validation
    │   ├── features.ts                  # Premium feature config and limits
    │   ├── prisma.ts                    # Prisma client singleton
    │   ├── rate-limit.ts                # Per-IP rate limiting
    │   └── utils.ts                     # cn(), formatCurrency(), formatDate()
    ├── types/
    │   └── index.ts                     # TypeScript interfaces
    ├── styles/                          # Additional styles
    └── hooks/                           # Custom hooks
```

---

## Database Schema

### Models

| Model | Description |
|-------|-------------|
| **User** | id (cuid), email (unique), name, password (hashed), isPremium, isAdmin, passwordResetToken, passwordResetExpiry, createdAt, updatedAt |
| **Account** | id, userId (FK), name, balance (Decimal 15,2), currency (default MVR), color, icon, isActive, institution, type (enum), createdAt, updatedAt |
| **Transaction** | id, userId (FK), accountId (FK), categoryId (FK), amount (Decimal 15,2), currency, description, merchantName, note, isRecurring, isExcluded, type (enum), date, tags (JSON), createdAt, updatedAt |
| **Category** | id, userId (FK), name, icon, color, isSystem, sortOrder, isActive, type (enum), createdAt |
| **Budget** | id, userId (FK), categoryId (FK), name, amount (Decimal 15,2), rollover, alertThreshold (default 75), isActive, spent, remaining, period (enum), startDate, createdAt, updatedAt |
| **Goal** | id, userId (FK), name, targetAmount (Decimal 15,2), currentAmount (Decimal 15,2), icon, color, monthlyContribution (Decimal 15,2), completedAt, type (enum), targetDate, status (enum), createdAt, updatedAt |
| **Notification** | id, userId (FK), type (enum), title, message, data (JSON), isRead, createdAt |

### Enums

| Enum | Values |
|------|--------|
| **AccountType** | checking, savings, credit_card, cash, investment, loan, mortgage, crypto, other |
| **TransactionType** | expense, income, transfer |
| **BudgetPeriod** | weekly, biweekly, monthly, quarterly, yearly |
| **GoalType** | savings, debt_payoff, emergency_fund, purchase, investment, custom |
| **GoalStatus** | active, paused, completed, abandoned |
| **NotificationType** | budget_alert, bill_reminder, goal_milestone, anomaly, insight, system |

### Relationships

- **User** 1:N Account, Transaction, Category, Budget, Goal, Notification
- **Account** 1:N Transaction
- **Category** 1:N Transaction, Budget

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL (optional — app works with client-side localStorage state without it)

### Installation

```bash
# Clone the repository
git clone https://github.com/nashin2025/financeflow.git
cd financeflow

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and secrets

# Generate Prisma client
npx prisma generate

# Push schema to database (if using PostgreSQL)
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Start development server |
| `build` | `prisma generate && next build` | Generate Prisma client and build for production |
| `start` | `next start` | Start production server |
| `lint` | `eslint` | Run ESLint |
| `postinstall` | `prisma generate` | Auto-generate Prisma client after npm install |

---

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Yes | Secret for JWT signing (fallback) | `your-super-secret-key` |
| `JWT_ACCESS_SECRET` | No | Access token secret (overrides JWT_SECRET) | `your-access-secret` |
| `JWT_REFRESH_SECRET` | No | Refresh token secret (overrides JWT_SECRET) | `your-refresh-secret` |
| `ADMIN_SECRET` | Yes | Admin panel access secret | `your-admin-secret` |
| `NEXT_PUBLIC_APP_URL` | No | App URL for password reset links | `http://localhost:3000` |

---

## API Reference

### Authentication

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/api/auth/login` | Login with email/password | 5 req / 15 min |
| POST | `/api/auth/register` | Create new user account | 3 req / 15 min |
| POST | `/api/auth/logout` | Clear auth cookies | — |
| POST | `/api/auth/refresh` | Refresh access token | 10 req / min |
| GET | `/api/auth/me` | Get current user profile | — |
| POST | `/api/auth/forgot-password` | Request password reset token | 3 req / hour |
| POST | `/api/auth/reset-password` | Reset password with token | 5 req / 15 min |
| POST | `/api/auth/change-password` | Change password (logged in) | 5 req / 15 min |

### Resources

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List transactions (query: type, accountId, categoryId, limit, offset) |
| POST | `/api/transactions` | Create transaction |
| GET | `/api/accounts` | List accounts (query: isActive) |
| POST | `/api/accounts` | Create account |
| GET | `/api/budgets` | List budgets (query: isActive) |
| POST | `/api/budgets` | Create budget |
| GET | `/api/goals` | List goals (query: status) |
| POST | `/api/goals` | Create goal |
| GET | `/api/categories` | List categories (query: type, isActive) |
| POST | `/api/categories` | Create category |
| GET | `/api/notifications` | List notifications (query: isRead, limit) |
| POST | `/api/notifications` | Create notification |
| GET | `/api/me` | Get user profile with counts |
| PUT | `/api/me` | Update user profile (name) |

### Admin (protected by `ADMIN_SECRET` query param or admin JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| PUT | `/api/users/[id]` | Toggle user premium status |
| DELETE | `/api/users/[id]` | Delete user |

### Middleware Protection

- **Public** (no auth): `/api/auth/*`
- **Protected** (JWT required): `/api/transactions`, `/api/accounts`, `/api/budgets`, `/api/goals`, `/api/categories`, `/api/notifications`, `/api/me`
- **Admin** (ADMIN_SECRET or admin JWT): `/api/users`, `/api/admin`

---

## Premium vs Free

| Feature | Free | Premium |
|---------|------|---------|
| Budgets | 3 | Unlimited |
| Goals | 2 | Unlimited |
| Accounts | 5 | Unlimited |
| AI Assistant | ❌ | ✅ |
| Advanced Analytics | ❌ | ✅ |
| Export Data | ❌ | ✅ |
| Custom Categories | ❌ | ✅ |
| Bill Reminders | ❌ | ✅ |
| Multi-Currency | ❌ | ✅ |

---

## Design System

### Theme
- **Dark mode** with glassmorphic effects (backdrop blur, transparency)
- **Primary gradient**: Indigo (#6366F1) to Purple (#8B5CF6)
- **Semantic colors**: Success (#10B981), Warning (#F59E0B), Error (#EF4444), Info (#3B82F6)

### Typography
| Font | Usage |
|------|-------|
| **Inter** | Body text and UI elements |
| **JetBrains Mono** | Numbers and financial data |
| **Space Grotesk** | Headings and display text |

### Animations
| Animation | Description |
|-----------|-------------|
| `fadeIn` | Fade in from transparent |
| `slideUp` | Slide up from bottom |
| `slideIn` | Slide in from right |
| `slideLeft` | Slide in from left |
| `pulse-glow` | Pulsing glow effect |
| `shimmer` | Skeleton loading shimmer |

### Currency & Languages
- **Default currency**: MVR (Maldivian Rufiyaa)
- **Supported currencies**: MVR, USD, EUR, GBP, INR, SGD
- **UI languages**: English, Dhivehi, Sinhala, Tamil

---

## Security

| Feature | Implementation |
|---------|---------------|
| **JWT tokens** | Access token (15 min), Refresh token (7 days) |
| **Cookies** | httpOnly, secure in production, sameSite=lax |
| **Password hashing** | bcrypt with cost factor 12 |
| **Rate limiting** | Per-IP on all auth endpoints |
| **Input validation** | Email format, password strength, amount parsing |
| **Admin protection** | Secret token or admin JWT required |

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your repository
4. Add environment variables (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_SECRET`)
5. Deploy

### Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

### Configuration

- `vercel.json` — Silent GitHub deployments
- `next.config.ts` — Unoptimized images, trailing slash, compression enabled
- Build script auto-runs `prisma generate`

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- [Next.js](https://nextjs.org/) — React framework
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [Prisma](https://prisma.io/) — Database ORM
- [Zustand](https://zustand-demo.pmnd.rs/) — State management
- [Recharts](https://recharts.org/) — Chart library
- [Lucide](https://lucide.dev/) — Icon library

<!-- Deploy trigger -->
