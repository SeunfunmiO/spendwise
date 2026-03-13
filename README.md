# 💰 SpendWise — Smart Personal Finance Tracker

A full-stack SaaS web application that helps users track income and expenses, set budget goals, and visualize their spending habits through an interactive dashboard.

![SpendWise](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=for-the-badge&logo=tailwindcss)

---

## 🌐 Live Demo

🔗 [spendwise.vercel.app](https://spendwise.vercel.app)

> **Demo credentials**
> Email: `demo@spendwise.app` · Password: `demo1234`

---

## 📸 Screenshots

> _Coming soon — dashboard, transactions, budgets, and reports pages_

---

## ✨ Features

### Core
- 🔐 Authentication — Google OAuth + Email/Password via NextAuth v5
- 📊 Dashboard — income vs expenses overview, stat cards, and spending charts
- 💸 Transactions — add, edit, delete, filter, and search income/expense records
- 🎯 Budgets — set monthly spending limits per category with progress tracking
- 📈 Reports — visual trends across the last 6 months with Recharts
- 📤 CSV Export — download your transaction history

### SaaS
- 💳 Paystack Integration — upgrade to premium plan
- 🔒 Plan-gated features — reports and export locked behind premium
- 📧 Welcome Email — automated onboarding email via Resend + React Email
- ⚠️ Budget Alerts — email notification when spending hits 80% of limit

### UX
- 🌙 Dark / Light mode toggle
- 🌍 Multi-language support — English, Spanish, French, Arabic, Portuguese
- 💱 Multi-currency display — NGN, USD, GBP, EUR
- 📱 Fully responsive — Sidebar on desktop, Bottom nav on mobile

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth.js v5 |
| Database | MongoDB + Mongoose |
| ORM | Mongoose |
| Charts | Recharts |
| Email | Resend + React Email |
| Payments | Paystack |
| Deployment | Vercel + MongoDB Atlas |

---

## 📁 Project Structure

```
spendwise/
├── app/
│   ├── (auth)/               # Login & Register pages
│   ├── (dashboard)/          # Protected dashboard pages
│   └── api/                  # NextAuth, Export, Paystack webhook
├── components/
│   ├── layout/               # Sidebar, Topbar, MobileNav
│   ├── dashboard/            # StatCards, Charts, RecentTransactions
│   ├── transactions/         # Table, Form, Filters
│   ├── budgets/              # BudgetCard, BudgetForm
│   └── ui/                   # Reusable base components
├── lib/
│   ├── actions/              # Server Actions (auth, transactions, budgets)
│   ├── mongodb.ts            # DB connection singleton
│   ├── auth.ts               # NextAuth config
│   ├── email.tsx             # Resend email helpers
│   └── utils.ts              # Shared utilities
├── models/                   # Mongoose models (User, Transaction, Budget)
├── emails/                   # React Email templates
├── constants/                # Nav items, categories
└── types/                    # Shared TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Cloud Console project (for OAuth)
- Resend account
- Paystack account

<!-- ### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SeunfunmiO/spendwise.git
cd spendwise
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root:
```bash
# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/spendwise

# NextAuth
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev

# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxx
```

4. **Run the development server**
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | Random secret for NextAuth (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Base URL of your app |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `RESEND_API_KEY` | Resend API key for emails |
| `RESEND_FROM_EMAIL` | Sender email address |
| `PAYSTACK_SECRET_KEY` | Paystack secret key |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key (client-side) |

--- -->

## 📊 Data Models

### User
```ts
{
  name, email, password?, image?,
  currency, language, plan, role,
  paystackCustomerId?
}
```

### Transaction
```ts
{
  userId, title, amount, type,
  category, date, note?,
  isRecurring, recurringInterval?
}
```

### Budget
```ts
{
  userId, category, limit,
  month, spent
}
```

---

## 🗺 Roadmap

- [x] Authentication (Google + Credentials)
- [x] Dashboard shell with dark/light mode
- [ ] Transactions CRUD
- [ ] Budget goals & tracking
- [ ] Reports & charts
- [ ] CSV export
- [ ] Paystack premium upgrade
- [ ] Budget alert emails
- [ ] Multi-language (i18n)
- [ ] Mobile app (React Native + Expo)

---

## 👩‍💻 Author

**Cynthia Omisore** — Full Stack Developer

[![Portfolio](https://img.shields.io/badge/Portfolio-cynthiaomisore.vercel.app-10b981?style=flat-square)](https://cynthiaomisore.vercel.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-cynthia--omisore-0077b5?style=flat-square&logo=linkedin)](https://linkedin.com/in/cynthia-omisore)
[![GitHub](https://img.shields.io/badge/GitHub-SeunfunmiO-181717?style=flat-square&logo=github)](https://github.com/SeunfunmiO)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).