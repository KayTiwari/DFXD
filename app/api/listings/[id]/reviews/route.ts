import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { rating, comment } = await request.json()
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating 1-5 required' }, { status: 400 })

  // Must have purchased the listing
  const hasPurchased = await prisma.order.findFirst({
    where: { buyerId: (session.user as any).id, listingId: id, status: { in: ['PAID', 'DELIVERED'] } }
  })
  if (!hasPurchased) return NextResponse.json({ error: 'Must purchase before reviewing' }, { status: 403 })

  // Only one review per user per listing
  const existing = await prisma.review.findFirst({ where: { listingId: id, userId: (session.user as any).id } })
  if (existing) return NextResponse.json({ error: 'Already reviewed' }, { status: 409 })

  const review = await prisma.review.create({
    data: { listingId: id, userId: (session.user as any).id, rating, comment: comment || null },
    include: { user: { select: { name: true } } }
  })
  return NextResponse.json(review)
}
