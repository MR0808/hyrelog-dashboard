import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const COMPANY_ID = 'e88f0edd-99d7-45ce-b3dd-af1b915c9ebf';
const ONBOARDING_COMPLETED_BY_USER_ID = 'fb910a23-5478-4e6c-ba9d-77d3e3420ad5';

const ADJECTIVES = [
  'Alpha', 'Beta', 'Swift', 'Prime', 'Core', 'Apex', 'Nova', 'Vertex', 'Pulse',
  'Spark', 'Flux', 'Bold', 'Clear', 'Quick', 'Smart', 'Bright', 'Stable', 'Safe',
  'Cloud', 'Edge', 'Meta', 'Hyper', 'Ultra', 'Mega', 'Micro', 'Global', 'Local',
  'Red', 'Blue', 'Green', 'Silver', 'Golden', 'Dark', 'Light', 'Wild', 'Calm'
];

const NOUNS = [
  'Workspace', 'Hub', 'Lab', 'Studio', 'Zone', 'Base', 'Node', 'Unit', 'Cell',
  'Grid', 'Flow', 'Stack', 'Layer', 'Scope', 'Realm', 'Vault', 'Forge', 'Lens',
  'Pilot', 'Beacon', 'Portal', 'Bridge', 'Peak', 'Crest', 'Draft', 'Shift', 'Run',
  'Batch', 'Queue', 'Stream', 'Trace', 'Log', 'Audit', 'Report', 'View', 'Scope'
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'workspace';
}

function randomName(usedNames: Set<string>): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  let name = `${adj} ${noun}`;
  let suffix = 0;
  while (usedNames.has(name)) {
    suffix += 1;
    name = `${adj} ${noun} ${suffix}`;
  }
  usedNames.add(name);
  return name;
}

async function main() {
  const connectionString = process.env.DATABASE_URL ?? '';
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const usedNames = new Set<string>();
  const usedSlugs = new Set<string>();

  function uniqueSlug(base: string): string {
    let slug = slugify(base);
    let candidate = slug;
    let n = 0;
    while (usedSlugs.has(candidate)) {
      n += 1;
      candidate = n === 1 ? `${slug}-${n}` : `${slug}-${n}`;
    }
    usedSlugs.add(candidate);
    return candidate;
  }

  const company = await prisma.company.findUnique({
    where: { id: COMPANY_ID },
    select: { id: true, name: true }
  });
  if (!company) {
    throw new Error(`Company ${COMPANY_ID} not found. Create the company first.`);
  }

  const count = 80;
  console.log(`Seeding ${count} workspaces for company "${company.name}" (${COMPANY_ID})...`);

  const today = new Date();

  for (let i = 0; i < count; i++) {
    const name = randomName(usedNames);
    const slug = uniqueSlug(name);
    await prisma.workspace.create({
      data: {
        companyId: COMPANY_ID,
        name,
        slug,
        onboardingStatus: 'COMPLETE',
        onboardingCompletedAt: today,
        onboardingCompletedBy: ONBOARDING_COMPLETED_BY_USER_ID
      }
    });
    if ((i + 1) % 20 === 0) console.log(`  Created ${i + 1}/${count}`);
  }

  console.log(`Done. Created ${count} workspaces.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
