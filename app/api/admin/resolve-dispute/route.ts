import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, resolution } = await request.json()
  const dispute = await prisma.dispute.update({ where: { id }, data: { status: 'RESOLVED', resolution } })
  await prisma.order.update({ where: { id: dispute.orderId }, data: { status: 'DELIVERED' } })
  await prisma.auditLog.create({ data: { userId: (session.user as any).id, action: 'RESOLVE_DISPUTE', details: `Resolved ${id}` } })
  return NextResponse.json({ success: true })
}
