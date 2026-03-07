import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      role: 'ADMIN',
      verified: true,
    },
  })

  // Create seller
  const seller = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      name: 'Seller One',
      role: 'SELLER',
      verified: true,
    },
  })

  // Create seller profile
  await prisma.sellerProfile.upsert({
    where: { userId: seller.id },
    update: {},
    create: {
      userId: seller.id,
      businessName: 'Data Corp',
      businessType: 'Data Provider',
      address: '123 Main St',
      phone: '123-456-7890',
      description: 'Providing quality data',
      verified: true,
    },
  })

  // Create listing
  await prisma.listing.upsert({
    where: { id: 'listing1' },
    update: {},
    create: {
      id: 'listing1',
      title: 'Customer Data Set',
      description: 'Anonymized customer data for analysis',
      price: 99.99,
      license: 'MIT',
      status: 'APPROVED',
      sellerId: seller.id,
    },
  })

  console.log('Seeded database')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })