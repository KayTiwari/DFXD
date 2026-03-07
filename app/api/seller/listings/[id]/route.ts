import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'SELLER')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const listing = await prisma.listing.findUnique({ where: { id: params.id } })
  if (!listing || listing.sellerId !== (session.user as any).id)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { title, description, price, category, fileUrl, sampleUrl, license, schema } = await request.json()
  const updated = await prisma.listing.update({
    where: { id: params.id },
    data: {
      title, description, price, category,
      fileUrl: fileUrl || null, sampleUrl: sampleUrl || null,
      license, schema: schema || null,
      status: 'PENDING', // re-submit for review on edit
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'SELLER')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const listing = await prisma.listing.findUnique({ where: { id: params.id } })
  if (!listing || listing.sellerId !== (session.user as any).id)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.listing.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
