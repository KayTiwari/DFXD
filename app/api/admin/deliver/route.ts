import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, fileUrl } = await request.json()
  if (!fileUrl) return NextResponse.json({ error: 'fileUrl required' }, { status: 400 })
  await prisma.order.update({ where: { id }, data: { fileUrl, status: 'DELIVERED', deliveredAt: new Date() } })
  await prisma.auditLog.create({ data: { userId: (session.user as any).id, action: 'DELIVER_FILE', details: `Delivered order ${id}` } })
  return NextResponse.json({ success: true })
}
