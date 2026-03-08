# DataFarm — Agricultural Data Marketplace

A full-stack B2B marketplace for buying and selling agricultural datasets, built with Next.js 16, Prisma (SQLite), NextAuth, and Stripe.

## Features

- **Password Authentication** — Email/password login and registration with bcrypt hashing
- **Seller Signup + Business Verification** — Sellers apply with business details; admin reviews and approves with status tracking (PENDING/APPROVED/REJECTED)
- **Admin Approval Dashboard** — Approve/reject sellers and listings; manage disputes, orders, file delivery, and audit logs
- **Listing Creation** — Sellers create dataset listings with multiple files, sample data, license, category, and schema
- **Listing Files** — Multi-file support per listing with name, URL, size, and type metadata
- **Listing Edit / Delete** — Sellers can edit (re-submits for review) or delete their own listings
- **Searchable Marketplace** — Browse and search approved datasets with category, price range, license type, and sort filters
- **Listing Detail Pages** — Full dataset details with file list, sample download, JSON schema preview, and purchase flow
- **Professional Landing Page** — Stats bar, value propositions, hero with CTAs, 4-column footer
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

## Database Schema

| Table | Description |
|-------|-------------|
| `User` | Accounts with role (BUYER/SELLER/ADMIN), password hash, verification |
| `SellerProfile` | Business info, application status (PENDING/APPROVED/REJECTED), rejection reason |
| `Listing` | Dataset listings with category, price, license, status |
| `ListingFile` | Multiple files per listing with name, URL, size, type |
| `Order` | Purchases with payment tracking, platform fee, delivery status |
| `Payment` | Stripe payment records linked to orders |
| `Dispute` | Order disputes with reason, status, admin resolution |
| `Message` | Per-order messaging between buyer and seller |
| `Review` | Star ratings and comments on listings |
| `AuditLog` | Admin action tracking with timestamps |

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
| `/` | Marketplace landing page with stats, value props, search, filters |
| `/auth/signin` | Sign in / create account |
| `/listings/[id]` | Listing detail page (files, reviews, sample preview, buy) |
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

## Deployment

### Recommended: Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the GitHub repo
3. Set environment variables in Vercel dashboard:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production domain)
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
4. Deploy — Vercel auto-detects Next.js and builds

### Database for Production

SQLite is used for local development. For production, switch to PostgreSQL:

1. Set up a PostgreSQL database (Neon, Supabase, or Vercel Postgres)
2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Add `DATABASE_URL` to your environment variables
4. Run `npx prisma migrate deploy` in production

---

## Remaining / Future Work

- [ ] S3 or cloud file storage (currently URL-based file references)
- [ ] Stripe Connect for direct seller payouts (currently platform collects all)
- [ ] Email notifications (order confirmed, dispute opened, seller approved)
- [ ] API access / bulk data purchase plans
- [ ] Subscription / recurring data access plans
- [ ] Multi-currency support
- [ ] Mobile-responsive polish
