# DataFarm — Agricultural Data Marketplace

A full-stack B2B marketplace for buying and selling agricultural datasets, built with Next.js 16, Prisma (SQLite), NextAuth, and Stripe.

## Features

- **Seller Signup + Business Verification** — Sellers apply with business details; admin reviews and approves
- **Admin Approval Dashboard** — Approve/reject sellers and listings; manage disputes, orders, and file delivery
- **Listing Creation** — Sellers create dataset listings with file URLs, sample data, license, and schema
- **Searchable Marketplace** — Buyers browse and search approved datasets
- **Buyer Checkout** — Stripe-powered checkout with terms acceptance
- **Platform Fee Collection** — 10% platform fee added automatically at checkout
- **Secure File Delivery** — File URLs revealed only after payment confirmed via Stripe webhook
- **Disputes / Manual Hold** — Buyers open disputes; admin can hold orders and resolve disputes
- **In-Platform Messaging** — Buyer/seller communicate per-order through the platform
- **Contracts / Terms Acceptance** — Both seller terms (at registration) and buyer terms (at purchase) are required

## Tech Stack

- **Frontend**: Next.js 16 App Router, Tailwind CSS, Lucide React
- **Backend**: Next.js API Routes, Prisma ORM, SQLite
- **Auth**: NextAuth.js (credentials provider)
- **Payments**: Stripe Checkout + Webhooks
- **Theme**: Agricultural (green/amber/earth tones)

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in your keys
npx prisma migrate dev
npm run dev
```

## Environment Variables

```
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

To seed an admin user, update `prisma/seed.ts` and run:
```bash
npx prisma db seed
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Marketplace homepage |
| `/auth/signin` | Sign in |
| `/seller/register` | Seller business verification |
| `/seller` | Seller dashboard (listings, orders, messaging) |
| `/admin` | Admin dashboard (sellers, listings, orders, disputes) |
| `/buyer/orders` | Buyer orders with download, disputes, messaging |

## Stripe Webhook

For local development, use Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

---

## Remaining / Future Work

- [ ] Email/password authentication (currently email-only, no password)
- [ ] S3 or cloud file storage for listing files (currently URL-based)
- [ ] Stripe Connect for direct seller payouts (currently platform collects all)
- [ ] Rating & review system for datasets and sellers
- [ ] Advanced marketplace filters (category, price range, license type, region)
- [ ] Email notifications (order confirmed, dispute opened, seller approved)
- [ ] Seller analytics dashboard (revenue, views, conversion)
- [ ] API access / bulk data purchase plans
- [ ] Dataset preview / sample download before purchase
- [ ] Subscription / recurring data access plans
- [ ] Multi-currency support
- [ ] Mobile-responsive polish
