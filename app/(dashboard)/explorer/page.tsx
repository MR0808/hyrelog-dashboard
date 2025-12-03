import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExplorerFiltersClient } from '@/components/explorer-filters-client';
import { PaginationClient } from '@/components/pagination-client';
import { getCompanyFilter } from '@/lib/company-context';

async function getWorkspaces() {
  const companyFilter = await getCompanyFilter();
  
  return prisma.workspace.findMany({
    where: companyFilter,
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

async function getEvents(searchParams: {
  workspaceId?: string;
  projectId?: string;
  actorId?: string;
  actorEmail?: string;
  action?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
}) {
  const page = parseInt(searchParams.page || '1');
  const pageSize = 50;
  const skip = (page - 1) * pageSize;
  
  const companyFilter = await getCompanyFilter();

  const where: any = {
    ...companyFilter,
  };

  if (searchParams.workspaceId) {
    where.workspaceId = searchParams.workspaceId;
  }

  if (searchParams.projectId) {
    where.projectId = searchParams.projectId;
  }

  if (searchParams.actorId) {
    where.actorId = searchParams.actorId;
  }

  if (searchParams.actorEmail) {
    where.actorEmail = { contains: searchParams.actorEmail, mode: 'insensitive' };
  }

  if (searchParams.action) {
    where.action = { contains: searchParams.action, mode: 'insensitive' };
  }

  if (searchParams.category) {
    where.category = { contains: searchParams.category, mode: 'insensitive' };
  }

  if (searchParams.startDate || searchParams.endDate) {
    where.createdAt = {};
    if (searchParams.startDate) {
      where.createdAt.gte = new Date(searchParams.startDate);
    }
    if (searchParams.endDate) {
      where.createdAt.lte = new Date(searchParams.endDate);
    }
  }

  const [events, total] = await Promise.all([
    prisma.auditEvent.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: pageSize,
      skip,
      include: {
        workspace: {
          select: {
            name: true,
            slug: true,
          },
        },
        project: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.auditEvent.count({ where }),
  ]);

  return { events, total, page, pageSize };
}

export default async function ExplorerPage({
  searchParams,
}: {
  searchParams: {
    workspaceId?: string;
    projectId?: string;
    actorId?: string;
    actorEmail?: string;
    action?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
  };
}) {
  const workspaces = await getWorkspaces();
  const { events, total, page, pageSize } = await getEvents(searchParams);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Event Explorer</h1>
        <p className="text-muted-foreground">Search and filter through your audit events</p>
      </div>

      <ExplorerFiltersClient workspaces={workspaces} searchParams={searchParams} />

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
          <CardDescription>
            Showing {events.length} of {total.toLocaleString()} events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Occurred</TableHead>
                <TableHead>Workspace</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No events found
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{new Date(event.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{event.workspace.name}</TableCell>
                    <TableCell>{event.action}</TableCell>
                    <TableCell>{event.category}</TableCell>
                    <TableCell>{event.actorEmail || event.actorId || 'N/A'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="mt-4">
            <PaginationClient currentPage={page} totalPages={totalPages} baseUrl="/explorer" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
