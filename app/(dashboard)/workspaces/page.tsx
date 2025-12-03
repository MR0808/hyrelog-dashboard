import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCompanyFilter } from '@/lib/company-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

async function getWorkspaces() {
  const companyFilter = await getCompanyFilter();
  
  const workspaces = await prisma.workspace.findMany({
    where: companyFilter,
    include: {
      company: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          members: true,
          apiKeys: true,
          webhooks: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return workspaces;
}

export default async function WorkspacesPage() {
  const workspaces = await getWorkspaces();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workspaces</h1>
          <p className="text-muted-foreground">Manage your workspaces and their configurations</p>
        </div>
        <Button>Create Workspace</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Workspaces</CardTitle>
          <CardDescription>A list of all workspaces in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>API Keys</TableHead>
                <TableHead>Webhooks</TableHead>
                <TableHead>Retention</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No workspaces found
                  </TableCell>
                </TableRow>
              ) : (
                workspaces.map((workspace) => (
                  <TableRow key={workspace.id}>
                    <TableCell className="font-medium">{workspace.name}</TableCell>
                    <TableCell className="font-mono text-sm">{workspace.slug}</TableCell>
                    <TableCell>{workspace.company.name}</TableCell>
                    <TableCell>{workspace._count.members}</TableCell>
                    <TableCell>{workspace._count.apiKeys}</TableCell>
                    <TableCell>{workspace._count.webhooks}</TableCell>
                    <TableCell>
                      {workspace.retentionDays ? `${workspace.retentionDays} days` : 'Inherited'}
                    </TableCell>
                    <TableCell>{new Date(workspace.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Link href={`/workspaces/${workspace.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
