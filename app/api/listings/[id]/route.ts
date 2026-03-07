import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      seller: { select: { name: true, verified: true, sellerProfile: { select: { businessName: true, businessType: true } } } },
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      _count: { select: { orders: true, reviews: true } }
    }
  })
  if (!listing || listing.status !== 'APPROVED') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(listing)
}
