import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'SELLER')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const orders = await prisma.order.findMany({
    where: { listing: { sellerId: (session.user as any).id } },
    include: { listing: { select: { title: true } }, buyer: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(orders)
}
