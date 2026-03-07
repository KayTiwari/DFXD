import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const license = searchParams.get('license')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sort = searchParams.get('sort') || 'newest'
    const search = searchParams.get('search')

    const where: any = { status: 'APPROVED' }
    if (category) where.category = category
    if (license) where.license = license
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const orderBy: any =
      sort === 'price_asc' ? { price: 'asc' }
      : sort === 'price_desc' ? { price: 'desc' }
      : { createdAt: 'desc' }

    const listings = await prisma.listing.findMany({
      where,
      orderBy,
      include: {
        seller: { select: { name: true, verified: true } },
        _count: { select: { orders: true, reviews: true } },
      },
    })

    return NextResponse.json(listings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}
