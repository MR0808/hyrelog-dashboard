import type { PrismaClient } from '../../generated/prisma/client';

export const continents = [
  'Asia',
  'Europe',
  'Africa',
  'Oceania',
  'North America',
  'South America',
  'Antarctica'
];

export async function seedContinents(prisma: PrismaClient) {
  const totalLength = continents.length;
  let count = 1;
  try {
    console.log('🌎 Seeding continents...');
    for (const continent of continents) {
      await prisma.continent.create({
        data: {
          name: continent
        }
      });
      console.log(`Seeded ${count} / ${totalLength} continents`);
      count++;
    }
    console.log(`✅ Seeded ${continents.length} continents`);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}
