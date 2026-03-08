import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, reason } = await request.json()
  await prisma.sellerProfile.update({
    where: { userId: id },
    data: { status: 'REJECTED', rejectionReason: reason || 'Application rejected by admin' },
  })
  await prisma.auditLog.create({ data: { userId: (session.user as any).id, action: 'REJECT_SELLER', details: `Rejected ${id}${reason ? ': ' + reason : ''}` } })
  return NextResponse.json({ success: true })
}
