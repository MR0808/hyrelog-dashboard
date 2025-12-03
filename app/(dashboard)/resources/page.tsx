import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCompanyFilter } from '@/lib/company-context';

async function getResources() {
  const companyFilter = await getCompanyFilter();
  
  // Extract resource IDs from event metadata
  // This is a simplified version - in production you'd want to index this better
  const events = await prisma.auditEvent.findMany({
    where: {
      ...companyFilter,
      metadata: {
        not: null as any,
      },
    },
    select: {
      id: true,
      metadata: true,
      workspaceId: true,
      createdAt: true,
    },
    take: 1000,
  });

  // Group by resourceId from metadata
  const resourceMap = new Map<string, {
    resourceId: string;
    eventCount: number;
    workspaces: Set<string>;
    lastSeen: Date;
  }>();

  events.forEach((event) => {
    const metadata = event.metadata as any;
    const resourceId = metadata?.resourceId || metadata?.targetId;

    if (resourceId) {
      const existing = resourceMap.get(resourceId) || {
        resourceId,
        eventCount: 0,
        workspaces: new Set<string>(),
        lastSeen: event.createdAt,
      };

      existing.eventCount++;
      existing.workspaces.add(event.workspaceId);
      if (event.createdAt > existing.lastSeen) {
        existing.lastSeen = event.createdAt;
      }

      resourceMap.set(resourceId, existing);
    }
  });

  return Array.from(resourceMap.values())
    .sort((a, b) => b.eventCount - a.eventCount)
    .map((r) => ({
      resourceId: r.resourceId,
      eventCount: r.eventCount,
      workspaceCount: r.workspaces.size,
      lastSeen: r.lastSeen,
    }));
}

export default async function ResourcesPage() {
  const resources = await getResources();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resources</h1>
        <p className="text-muted-foreground">Resources that have been acted upon</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Resources</CardTitle>
          <CardDescription>Resources sorted by event count</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource ID</TableHead>
                <TableHead>Event Count</TableHead>
                <TableHead>Workspaces</TableHead>
                <TableHead>Last Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No resources found
                  </TableCell>
                </TableRow>
              ) : (
                resources.map((resource) => (
                  <TableRow key={resource.resourceId}>
                    <TableCell className="font-mono text-sm">{resource.resourceId}</TableCell>
                    <TableCell>{resource.eventCount.toLocaleString()}</TableCell>
                    <TableCell>{resource.workspaceCount}</TableCell>
                    <TableCell>{new Date(resource.lastSeen).toLocaleString()}</TableCell>
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
