import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { listingId } = await request.json()

  if (!listingId) {
    return NextResponse.json({ error: 'Listing ID required' }, { status: 400 })
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    })

    if (!listing || listing.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Listing not found or not available' }, { status: 404 })
    }

    const order = await prisma.order.create({
      data: {
        buyerId: (session.user as any).id,
        listingId,
        amount: listing.price,
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}