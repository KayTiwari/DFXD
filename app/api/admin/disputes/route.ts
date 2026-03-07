import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const disputes = await prisma.dispute.findMany({
    include: { order: { include: { buyer: { select: { name: true, email: true } }, listing: { select: { title: true } } } } },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(disputes)
}
