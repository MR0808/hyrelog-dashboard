import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getCompanyFilter } from '@/lib/company-context';

async function getActors() {
  const companyFilter = await getCompanyFilter();
  
  // Get unique actors from events
  const actors = await prisma.auditEvent.groupBy({
    where: {
      ...companyFilter,
      OR: [
        { actorEmail: { not: null } },
        { actorId: { not: null } },
      ],
    },
    by: ['actorEmail', 'actorId'],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 100,
  });

  // Get workspace counts for each actor
  const actorsWithDetails = await Promise.all(
    actors.map(async (actor) => {
      const workspaces = await prisma.auditEvent.findMany({
        where: {
          ...companyFilter,
          OR: [
            actor.actorEmail ? { actorEmail: actor.actorEmail } : {},
            actor.actorId ? { actorId: actor.actorId } : {},
          ],
        },
        select: {
          workspaceId: true,
        },
        distinct: ['workspaceId'],
      });

      return {
        actorEmail: actor.actorEmail,
        actorId: actor.actorId,
        eventCount: actor._count.id,
        workspaceCount: workspaces.length,
      };
    })
  );

  return actorsWithDetails;
}

export default async function ActorsPage() {
  const actors = await getActors();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Actors</h1>
        <p className="text-muted-foreground">Users and systems that have performed actions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Actors</CardTitle>
          <CardDescription>Actors sorted by event count</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Identifier</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Event Count</TableHead>
                <TableHead>Workspaces</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No actors found
                  </TableCell>
                </TableRow>
              ) : (
                actors.map((actor, index) => (
                  <TableRow key={actor.actorId || actor.actorEmail || index}>
                    <TableCell className="font-mono text-sm">
                      {actor.actorId || 'N/A'}
                    </TableCell>
                    <TableCell>{actor.actorEmail || 'N/A'}</TableCell>
                    <TableCell>{actor.eventCount.toLocaleString()}</TableCell>
                    <TableCell>{actor.workspaceCount}</TableCell>
                    <TableCell>
                      <Link
                        href={`/actors/${encodeURIComponent(actor.actorId || actor.actorEmail || '')}`}
                      >
                        <Button variant="ghost" size="sm">
                          View Details
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
