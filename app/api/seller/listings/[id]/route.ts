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

  const { title, description, price, category, fileUrl, sampleUrl, license, schema, files } = await request.json()

  // Replace files if provided
  if (files) {
    await prisma.listingFile.deleteMany({ where: { listingId: params.id } })
    if (files.length > 0) {
      await prisma.listingFile.createMany({
        data: files.map((f: { name: string; url: string; size?: number; type?: string }) => ({
          listingId: params.id, name: f.name, url: f.url, size: f.size || null, type: f.type || null,
        })),
      })
    }
  }

  const updated = await prisma.listing.update({
    where: { id: params.id },
    data: {
      title, description, price, category,
      fileUrl: fileUrl || null, sampleUrl: sampleUrl || null,
      license, schema: schema || null,
      status: 'PENDING',
    },
    include: { files: true },
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
