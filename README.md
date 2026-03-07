# DataFarm — Agricultural Data Marketplace

A full-stack B2B marketplace for buying and selling agricultural datasets, built with Next.js 16, Prisma (SQLite), NextAuth, and Stripe.

## Features

- **Password Authentication** — Email/password login and registration with bcrypt hashing
- **Seller Signup + Business Verification** — Sellers apply with business details; admin reviews and approves
- **Admin Approval Dashboard** — Approve/reject sellers and listings; manage disputes, orders, file delivery, and audit logs
- **Listing Creation** — Sellers create dataset listings with file URLs, sample data, license, category, and schema
- **Listing Edit / Delete** — Sellers can edit (re-submits for review) or delete their own listings
- **Searchable Marketplace** — Browse and search approved datasets with category, price range, license type, and sort filters
- **Listing Detail Pages** — Full dataset details with sample download, JSON schema preview, and purchase flow
- **Buyer Checkout** — Stripe-powered checkout with terms acceptance
- **Platform Fee Collection** — 10% platform fee added automatically at checkout
- **Secure File Delivery** — File URLs revealed only after payment confirmed via Stripe webhook
- **Disputes / Manual Hold** — Buyers open disputes; admin can hold orders and resolve disputes
- **In-Platform Messaging** — Buyer/seller communicate per-order through the platform
- **Contracts / Terms Acceptance** — Both seller terms (at registration) and buyer terms (at purchase) are required
- **Rating & Review System** — 1-5 star ratings with comments; requires prior purchase; one review per buyer per listing
- **Seller Analytics** — Revenue, order counts, monthly breakdown, and listing performance metrics
- **Public Seller Profiles** — Business info, verified badge, and listing grid for each seller
- **Admin Audit Log** — Track all admin actions (approvals, rejections, holds, deliveries)
- **Category Filtering** — 8 agricultural categories: Crop Data, Soil & Weather, Livestock, Market Prices, Satellite Imagery, Pesticide & Fertilizer, General

## Tech Stack

- **Frontend**: Next.js 16 App Router, Tailwind CSS, Lucide React
- **Backend**: Next.js API Routes, Prisma ORM, SQLite
- **Auth**: NextAuth.js (credentials provider, bcryptjs)
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
| `/` | Marketplace homepage with search, filters, and listing grid |
| `/auth/signin` | Sign in / create account |
| `/listings/[id]` | Listing detail page (reviews, sample preview, buy) |
| `/sellers/[id]` | Public seller profile with business info and listings |
| `/seller/register` | Seller business verification application |
| `/seller` | Seller dashboard (listings, create/edit, orders, analytics) |
| `/admin` | Admin dashboard (sellers, listings, orders, disputes, audit log) |
| `/buyer/orders` | Buyer orders with download, disputes, messaging |

## Stripe Webhook

For local development, use Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

---

## Remaining / Future Work

- [ ] S3 or cloud file storage for listing files (currently URL-based)
- [ ] Stripe Connect for direct seller payouts (currently platform collects all)
- [ ] Email notifications (order confirmed, dispute opened, seller approved)
- [ ] API access / bulk data purchase plans
- [ ] Subscription / recurring data access plans
- [ ] Multi-currency support
- [ ] Mobile-responsive polish
