import { redirect } from 'next/navigation';
import { requireInternalAuth } from '@/lib/internal-auth';
import { prisma } from '@/lib/prisma';
import { CompanyDetail } from '@/components/internal/company-detail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default async function InternalCompanyDetailPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    await requireInternalAuth();

    const { id } = await params;

    const company = await prisma.company.findUnique({
        where: { id },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: 'asc' }
            },
            workspaces: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    createdAt: true
                }
            },
            plans: {
                include: {
                    plan: true
                }
            },
            apiKeys: {
                take: 10,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    prefix: true,
                    type: true,
                    createdAt: true,
                    revokedAt: true
                }
            },
            _count: {
                select: {
                    auditEvents: true,
                    workspaces: true,
                    members: true
                }
            }
        }
    });

    if (!company) {
        redirect('/internal/companies');
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{company.name}</h1>
                    <p className="text-muted-foreground">{company.slug}</p>
                </div>
                <Link
                    href="/internal/companies"
                    className="text-sm text-muted-foreground hover:underline"
                >
                    ← Back to Companies
                </Link>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                    <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="keys">API Keys</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <CompanyDetail company={company} />
                </TabsContent>

                <TabsContent value="billing">
                    <div className="text-center text-muted-foreground py-8">
                        Billing management coming soon
                    </div>
                </TabsContent>

                <TabsContent value="workspaces">
                    <div className="text-center text-muted-foreground py-8">
                        Workspace management coming soon
                    </div>
                </TabsContent>

                <TabsContent value="users">
                    <div className="text-center text-muted-foreground py-8">
                        User management coming soon
                    </div>
                </TabsContent>

                <TabsContent value="keys">
                    <div className="text-center text-muted-foreground py-8">
                        API key management coming soon
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
