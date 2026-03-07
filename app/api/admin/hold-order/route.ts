import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const isHeld = order.status === 'HELD'
  await prisma.order.update({ where: { id }, data: { status: isHeld ? 'PAID' : 'HELD', heldAt: isHeld ? null : new Date() } })
  return NextResponse.json({ success: true, newStatus: isHeld ? 'PAID' : 'HELD' })
}
