/**
 * Seed Script for HyreLog Dashboard
 * 
 * Creates:
 * - HyreLog admin user (from SEED_ADMIN_EMAIL/PASSWORD)
 * - Customer user (customer@hyrelog.local / ChangeMe123!)
 * - Platform role for admin
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding dashboard database...');

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@hyrelog.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const customerEmail = 'customer@hyrelog.local';
  const customerPassword = 'ChangeMe123!';

  // Create HyreLog admin user
  const hashedAdminPassword = await hash(adminPassword, 10);
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'HyreLog Admin',
      emailVerified: true,
    },
  });

  // Create platform role for admin
  await prisma.platformRole.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      role: 'HYRELOG_ADMIN',
    },
  });

  console.log(`✅ Created admin user: ${adminEmail}`);
  console.log(`   User ID: ${adminUser.id}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Platform Role: HYRELOG_ADMIN`);

  // Create customer user
  const hashedCustomerPassword = await hash(customerPassword, 10);
  const customerUser = await prisma.user.upsert({
    where: { email: customerEmail },
    update: {},
    create: {
      email: customerEmail,
      name: 'Customer User',
      emailVerified: true,
    },
  });

  console.log(`✅ Created customer user: ${customerEmail}`);
  console.log(`   User ID: ${customerUser.id}`);
  console.log(`   Password: ${customerPassword}`);
  console.log(`   Note: No company membership yet - attach via admin page`);

  console.log('\n✨ Seeding complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Login as admin and navigate to /admin/companies');
  console.log('2. Find or create a company in the API');
  console.log('3. Use the admin page to attach company membership to customer user');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
