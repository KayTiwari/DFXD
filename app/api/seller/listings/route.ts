import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'SELLER')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const listings = await prisma.listing.findMany({
    where: { sellerId: (session.user as any).id },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(listings)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'SELLER')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { title, description, price, fileUrl, sampleUrl, license, schema } = await request.json()
  const listing = await prisma.listing.create({
    data: {
      title, description, price, fileUrl: fileUrl || null,
      sampleUrl: sampleUrl || null, license, schema: schema || null,
      sellerId: (session.user as any).id,
    }
  })
  return NextResponse.json(listing)
}
