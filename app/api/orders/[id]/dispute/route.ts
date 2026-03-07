import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const disputes = await prisma.dispute.findMany({ where: { orderId: id } })
  return NextResponse.json(disputes)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { reason } = await request.json()
  const order = await prisma.order.findUnique({ where: { id } })
  if (!order || order.buyerId !== (session.user as any).id)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!['PAID', 'DELIVERED'].includes(order.status))
    return NextResponse.json({ error: 'Can only dispute paid orders' }, { status: 400 })
  const dispute = await prisma.dispute.create({ data: { orderId: id, reason } })
  await prisma.order.update({ where: { id }, data: { status: 'DISPUTED' } })
  return NextResponse.json(dispute)
}
