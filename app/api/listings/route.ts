import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: 'APPROVED' },
      include: {
        seller: {
          select: { name: true, verified: true }
        }
      }
    })

    return NextResponse.json(listings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}