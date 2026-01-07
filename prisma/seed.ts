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

/**
 * Clear all data from the dashboard database
 * Deletes in order to respect foreign key constraints
 */
async function resetDatabase() {
  console.log('🗑️  Resetting dashboard database...');
  
  // Delete in order to respect foreign key constraints
  await prisma.auditLog.deleteMany({});
  console.log('  ✓ Cleared audit logs');
  
  await prisma.companyInvite.deleteMany({});
  console.log('  ✓ Cleared company invites');
  
  await prisma.emailVerificationToken.deleteMany({});
  console.log('  ✓ Cleared email verification tokens');
  
  await prisma.companyMembership.deleteMany({});
  console.log('  ✓ Cleared company memberships');
  
  // Note: Company deletion should be handled by API database
  // We only manage company memberships in dashboard DB
  
  await prisma.platformRole.deleteMany({});
  console.log('  ✓ Cleared platform roles');
  
  await prisma.session.deleteMany({});
  console.log('  ✓ Cleared sessions');
  
  await prisma.account.deleteMany({});
  console.log('  ✓ Cleared accounts');
  
  await prisma.verificationToken.deleteMany({});
  console.log('  ✓ Cleared verification tokens');
  
  await prisma.user.deleteMany({});
  console.log('  ✓ Cleared users');
  
  console.log('✅ Database reset complete!\n');
}

async function main() {
  // Check for --reset flag
  const args = process.argv.slice(2);
  const shouldReset = args.includes('--reset') || args.includes('-r');
  
  if (shouldReset) {
    console.log('⚠️  WARNING: This will delete ALL data from the dashboard database!');
    console.log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');
    
    // Give user 3 seconds to cancel
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await resetDatabase();
  }
  
  console.log('🌱 Seeding dashboard database...');

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@hyrelog.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const customerEmail = 'customer@hyrelog.local';
  const customerPassword = 'ChangeMe123!';

  // Better-auth stores passwords in Account table with provider "credential"
  // We need to hash passwords using the same method better-auth uses
  // For now, create users and Account records manually
  // Note: This is a workaround - ideally we'd use better-auth's API

  // Create or get HyreLog admin user
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'HyreLog Admin',
        firstName: 'HyreLog',
        lastName: 'Admin',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        status: 'ACTIVE',
      },
    });
  } else {
    // Update existing admin user to ensure required fields
    adminUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        firstName: adminUser.firstName || 'HyreLog',
        lastName: adminUser.lastName || 'Admin',
        emailVerified: true,
        emailVerifiedAt: adminUser.emailVerifiedAt || new Date(),
        status: 'ACTIVE',
      },
    });
  }

  // Create platform role for admin
  await prisma.platformRole.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      role: 'HYRELOG_ADMIN',
    },
  });

  // Create Account record for admin (better-auth stores password here)
  // Note: We'll need to use better-auth's password hashing
  // For now, users should sign up via /signup to set passwords properly
  const adminAccount = await prisma.account.findFirst({
    where: {
      userId: adminUser.id,
      provider: 'credential',
    },
  });

  if (!adminAccount) {
    console.log(`⚠️  Admin user created but password not set.`);
    console.log(`   Please sign up at /signup with email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
  }

  console.log(`✅ Created admin user: ${adminEmail}`);
  console.log(`   User ID: ${adminUser.id}`);
  console.log(`   Platform Role: HYRELOG_ADMIN`);

  // Create or get customer user
  let customerUser = await prisma.user.findUnique({
    where: { email: customerEmail },
  });

  if (!customerUser) {
    customerUser = await prisma.user.create({
      data: {
        email: customerEmail,
        name: 'Customer User',
        firstName: 'Customer',
        lastName: 'User',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        status: 'ACTIVE',
      },
    });
  } else {
    // Update existing customer user to ensure required fields
    customerUser = await prisma.user.update({
      where: { id: customerUser.id },
      data: {
        firstName: customerUser.firstName || 'Customer',
        lastName: customerUser.lastName || 'User',
        emailVerified: true,
        emailVerifiedAt: customerUser.emailVerifiedAt || new Date(),
        status: 'ACTIVE',
      },
    });
  }

  const customerAccount = await prisma.account.findFirst({
    where: {
      userId: customerUser.id,
      provider: 'credential',
    },
  });

  if (!customerAccount) {
    console.log(`⚠️  Customer user created but password not set.`);
    console.log(`   Please sign up at /signup with email: ${customerEmail}`);
    console.log(`   Password: ${customerPassword}`);
  }

  console.log(`✅ Created customer user: ${customerEmail}`);
  console.log(`   User ID: ${customerUser.id}`);
  console.log(`   Email Verified: ${customerUser.emailVerified ? 'Yes' : 'No'}`);

  console.log('\n✨ Seeding complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Sign up at /signup for both users to set passwords:');
  console.log(`   - Admin: ${adminEmail} / ${adminPassword}`);
  console.log(`   - Customer: ${customerEmail} / ${customerPassword}`);
  console.log('2. After signup, verify email (check console for verification link in dev mode)');
  console.log('3. Login and create a company at /create-company');
  console.log('4. As company admin, invite other users at /app/settings/members');
  console.log('\n💡 Note: In dev mode, email links are logged to console for easy testing');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
