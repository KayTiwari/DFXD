import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await request.json()

  await prisma.listing.update({
    where: { id },
    data: { status: 'APPROVED' }
  })

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'APPROVE_LISTING',
      details: `Approved listing ${id}`
    }
  })

  return NextResponse.json({ success: true })
}