import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [listings, sellers, transactions] = await Promise.all([
    prisma.listing.count({ where: { status: 'APPROVED' } }),
    prisma.user.count({ where: { role: 'SELLER', verified: true } }),
    prisma.order.count({ where: { status: { in: ['PAID', 'DELIVERED'] } } }),
  ])
  return NextResponse.json({ listings, sellers, transactions })
}
