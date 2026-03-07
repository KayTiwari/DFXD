import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const messages = await prisma.message.findMany({
    where: { orderId: id },
    include: { from: { select: { name: true } } },
    orderBy: { createdAt: 'asc' }
  })
  return NextResponse.json(messages)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { content } = await request.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })
  const order = await prisma.order.findUnique({ where: { id }, include: { listing: { select: { sellerId: true } } } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const fromId = (session.user as any).id
  const toId = fromId === order.buyerId ? order.listing.sellerId : order.buyerId
  const message = await prisma.message.create({
    data: { fromId, toId, content, orderId: id },
    include: { from: { select: { name: true } } }
  })
  return NextResponse.json(message)
}
