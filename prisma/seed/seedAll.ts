import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

import { seedContinents } from './seedContinents';
import { seedCurrencies } from './seedCurrencies';
import { seedCountries } from './seedCountries';
import { seedRegions } from './seedRegions';
import { HYRELOG_PLANS } from './seedPlans';
import { HYRELOG_ADDONS } from './seedAddons';

const connectionString = `${process.env.DATABASE_URL ?? ''}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function clearSeedData() {
  console.log('🧹 Clearing seeded data...');
  await prisma.$transaction([
    prisma.entitlementSnapshot.deleteMany(),
    prisma.subscriptionAddOn.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.addOn.deleteMany(),
    prisma.plan.deleteMany(),
    prisma.region.deleteMany(),
    prisma.country.deleteMany(),
    prisma.currency.deleteMany(),
    prisma.continent.deleteMany()
  ]);
}

async function seedPlans() {
  console.log('📦 Seeding plans...');
  await prisma.plan.createMany({
    data: HYRELOG_PLANS.map((plan) => ({
      code: plan.code,
      name: plan.name,
      planType: plan.planType,
      status: plan.status,
      description: plan.description,
      baseEntitlements: plan.baseEntitlements
    })),
    skipDuplicates: true
  });
  console.log(`✅ Seeded ${HYRELOG_PLANS.length} plans`);
}

async function seedAddOns() {
  console.log('🧩 Seeding add-ons...');
  await prisma.addOn.createMany({
    data: HYRELOG_ADDONS.map((addon) => ({
      code: addon.code,
      name: addon.name,
      description: addon.description,
      billingType: addon.billingType,
      isActive: addon.isActive,
      entitlementDelta: addon.entitlementDelta
    })),
    skipDuplicates: true
  });
  console.log(`✅ Seeded ${HYRELOG_ADDONS.length} add-ons`);
}

async function main() {
  await clearSeedData();

  await seedContinents(prisma);
  await seedCurrencies(prisma);
  await seedCountries(prisma);
  await seedRegions(prisma);
  await seedPlans();
  await seedAddOns();

  console.log('🎉 All seed data loaded successfully!');
}

main()
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
