import { requireInternalAuth } from '@/lib/internal-auth';
import { CreateCompanyForm } from '@/components/internal/create-company-form';
import { prisma } from '@/lib/prisma';

export default async function InternalCreateCompanyPage() {
  await requireInternalAuth();

  const plans = await prisma.plan.findMany({
    where: { active: true },
    orderBy: { priceCents: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Company</h1>
        <p className="text-muted-foreground">
          Create a new company for an enterprise customer
        </p>
      </div>

      <CreateCompanyForm plans={plans} />
    </div>
  );
}

