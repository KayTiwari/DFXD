import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const existing = await prisma.sellerProfile.findUnique({ where: { userId } })
  if (existing) return NextResponse.json({ error: 'Seller application already exists' }, { status: 409 })

  const { businessName, businessType, taxId, address, phone, website, description } = await request.json()
  if (!businessName || !businessType || !address || !phone || !description)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  await prisma.sellerProfile.create({
    data: { userId, businessName, businessType, taxId: taxId || null, address, phone, website: website || null, description }
  })
  await prisma.auditLog.create({ data: { userId, action: 'SELLER_APPLY', details: `${businessName} applied` } })
  return NextResponse.json({ success: true })
}
