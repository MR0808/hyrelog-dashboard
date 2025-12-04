import { requireInternalAuth } from '@/lib/internal-auth';
import { prisma } from '@/lib/prisma';
import { CompaniesList } from '@/components/internal/companies-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function InternalCompaniesPage({
  searchParams,
}: {
  searchParams: { search?: string; plan?: string; billingMode?: string };
}) {
  await requireInternalAuth();

  const where: any = {};

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: 'insensitive' } },
      { slug: { contains: searchParams.search, mode: 'insensitive' } },
    ];
  }

  // @ts-ignore - billingMode may not exist yet
  if (searchParams.billingMode) {
    // @ts-ignore
    where.billingMode = searchParams.billingMode;
  }

  const companies = await prisma.company.findMany({
    where,
    include: {
      members: {
        take: 1,
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
      plans: {
        include: {
          plan: true,
        },
      },
      _count: {
        select: {
          workspaces: true,
          members: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground">
            Manage all customer companies and their settings
          </p>
        </div>
        <Button asChild>
          <Link href="/internal/companies/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Company
          </Link>
        </Button>
      </div>

      <CompaniesList companies={companies} />
    </div>
  );
}

