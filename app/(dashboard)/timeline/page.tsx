import { prisma } from '@/lib/prisma';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { TimelineViewClient } from '@/components/timeline-view-client';
import { getCompanyFilter } from '@/lib/company-context';

async function getTimelineEvents(searchParams: {
    workspaceId?: string;
    actorId?: string;
    actorEmail?: string;
    resourceId?: string;
    startDate?: string;
    endDate?: string;
}) {
    const companyFilter = await getCompanyFilter();

    const where: any = {
        ...companyFilter
    };

    if (searchParams.workspaceId) {
        where.workspaceId = searchParams.workspaceId;
    }

    if (searchParams.actorId) {
        where.actorId = searchParams.actorId;
    }

    if (searchParams.actorEmail) {
        where.actorEmail = searchParams.actorEmail;
    }

    if (searchParams.resourceId) {
        where.metadata = {
            path: ['resourceId'],
            equals: searchParams.resourceId
        };
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

    const events = await prisma.auditEvent.findMany({
        where,
        orderBy: {
            createdAt: 'asc'
        },
        take: 100,
        include: {
            workspace: {
                select: {
                    name: true
                }
            }
        }
    });

    return events;
}

export default async function TimelinePage({
    searchParams
}: {
    searchParams: Promise<{
        workspaceId?: string;
        actorId?: string;
        actorEmail?: string;
        resourceId?: string;
        startDate?: string;
        endDate?: string;
    }>;
}) {
    const resolvedSearchParams = await searchParams;
    const events = await getTimelineEvents(resolvedSearchParams);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Timeline</h1>
                <p className="text-muted-foreground">
                    Visual timeline of audit events
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Event Timeline</CardTitle>
                    <CardDescription>
                        Showing {events.length} events in chronological order
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TimelineViewClient events={events} />
                </CardContent>
            </Card>
        </div>
    );
}
