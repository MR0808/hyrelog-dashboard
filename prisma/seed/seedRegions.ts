import type { PrismaClient } from '../../generated/prisma/client';
import { State } from 'country-state-city';

export async function seedRegions(prisma: PrismaClient) {
  try {
    let count = 0;
    const countries = await prisma.country.findMany();
    const countryCount = countries.length;
    for (const country of countries) {
      const states = State.getStatesOfCountry(country.isoCode);
      const statesCount = states.length;
      let stateCount = 0;
      count++;

      for (const state of states) {
        await prisma.region.create({
          data: {
            code: state.isoCode,
            name: state.name,
            countryId: country.id
          }
        });
        stateCount++;
        console.log(`State ${stateCount} / ${statesCount} - Country ${count} / ${countryCount}`);
      }
    }
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}
