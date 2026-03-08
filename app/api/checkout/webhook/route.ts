import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeSecretKey || !stripeWebhookSecret) {
    return NextResponse.json({ error: 'Server not configured for webhook' }, { status: 500 })
  }
  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-02-25.clover' })

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!
  let event: Stripe.Event
  try { event = stripe.webhooks.constructEvent(body, sig, stripeWebhookSecret) }
  catch { return NextResponse.json({ error: 'Invalid signature' }, { status: 400 }) }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId
    if (!orderId) return NextResponse.json({ ok: true })
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { listing: true } })
    if (!order) return NextResponse.json({ ok: true })
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID', paymentId: session.id, fileUrl: order.listing.fileUrl, deliveredAt: new Date() }
    })
    await prisma.payment.create({ data: { orderId, stripeId: session.id, amount: order.amount, status: 'PAID' } })
    await prisma.auditLog.create({ data: { action: 'PAYMENT_RECEIVED', details: `Order ${orderId} paid` } })
  }
  return NextResponse.json({ ok: true })
}
