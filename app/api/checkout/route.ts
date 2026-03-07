import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-01-27.acacia' })
const PLATFORM_FEE_PCT = 0.1

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listingId, termsAccepted } = await request.json()
  if (!termsAccepted) return NextResponse.json({ error: 'Must accept terms' }, { status: 400 })

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { seller: { select: { name: true } } }
  })
  if (!listing || listing.status !== 'APPROVED') {
    return NextResponse.json({ error: 'Listing not available' }, { status: 404 })
  }

  const platformFee = parseFloat((listing.price * PLATFORM_FEE_PCT).toFixed(2))
  const totalAmount = parseFloat((listing.price + platformFee).toFixed(2))

  const order = await prisma.order.create({
    data: {
      buyerId: (session.user as any).id,
      listingId,
      amount: totalAmount,
      platformFee,
      termsAccepted: true,
    }
  })

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: listing.title,
          description: `DataFarm dataset from ${listing.seller.name}`,
        },
        unit_amount: Math.round(totalAmount * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.NEXTAUTH_URL}/buyer/orders?success=1`,
    cancel_url: `${process.env.NEXTAUTH_URL}/?cancelled=1`,
    metadata: { orderId: order.id },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
