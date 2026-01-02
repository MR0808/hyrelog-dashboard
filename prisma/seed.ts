/**
 * Seed Script for HyreLog Dashboard
 * 
 * Creates:
 * - HyreLog admin user (from SEED_ADMIN_EMAIL/PASSWORD)
 * - Customer user (customer@hyrelog.local / ChangeMe123!)
 * - Platform role for admin
 */

import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Prisma 7: Create adapter for direct database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding dashboard database...');

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@hyrelog.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const customerEmail = 'customer@hyrelog.local';
  const customerPassword = 'ChangeMe123!';

  // Note: better-auth handles password hashing, so we create users without passwords
  // Users will need to sign up via the UI or we can use better-auth's admin API
  // For now, create users and note that passwords must be set via sign-up or admin API

  // Create HyreLog admin user
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
  console.log(`   Platform Role: HYRELOG_ADMIN`);
  console.log(`   Note: Sign up via /login to set password: ${adminPassword}`);

  // Create customer user
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
  console.log(`   Note: Sign up via /login to set password: ${customerPassword}`);
  console.log(`   Note: No company membership yet - attach via admin page`);

  console.log('\n✨ Seeding complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Sign up via /login for both users (better-auth will hash passwords)');
  console.log('2. Login as admin and navigate to /admin/companies');
  console.log('3. Find or create a company in the API');
  console.log('4. Use the admin page to attach company membership to customer user');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
