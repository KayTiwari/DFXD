import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'SELLER')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sellerId = (session.user as any).id

  const [listings, orders] = await Promise.all([
    prisma.listing.findMany({ where: { sellerId }, select: { id: true, title: true, price: true, status: true, _count: { select: { orders: true, reviews: true } } } }),
    prisma.order.findMany({
      where: { listing: { sellerId } },
      select: { amount: true, platformFee: true, status: true, createdAt: true },
    })
  ])

  const paidOrders = orders.filter(o => ['PAID', 'DELIVERED'].includes(o.status))
  const totalRevenue = paidOrders.reduce((s, o) => s + o.amount - (o.platformFee || 0), 0)
  const totalOrders = paidOrders.length
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length

  // Revenue by month (last 6 months)
  const monthlyRevenue: Record<string, number> = {}
  paidOrders.forEach(o => {
    const month = new Date(o.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' })
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (o.amount - (o.platformFee || 0))
  })

  return NextResponse.json({ totalRevenue, totalOrders, pendingOrders, listings, monthlyRevenue })
}
