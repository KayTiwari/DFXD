import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, verified: true, createdAt: true,
      sellerProfile: {
        select: {
          businessName: true, businessType: true, description: true,
          website: true, verified: true,
        },
      },
      listings: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, title: true, description: true, price: true,
          category: true, license: true, createdAt: true,
          _count: { select: { orders: true, reviews: true } },
        },
      },
    },
  })

  if (!user || !user.sellerProfile) {
    return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
  }

  return NextResponse.json(user)
}
