import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

async function getWorkspace(id: string) {
    const workspace = await prisma.workspace.findUnique({
        where: { id },
        include: {
            company: {
                select: {
                    name: true
                }
            },
            members: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            },
            apiKeys: {
                orderBy: {
                    createdAt: 'desc'
                }
            },
            webhooks: {
                orderBy: {
                    createdAt: 'desc'
                }
            },
            _count: {
                select: {
                    projects: true
                }
            }
        }
    });

    return workspace;
}

export default async function WorkspaceDetailPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const workspace = await getWorkspace(id);

    if (!workspace) {
        notFound();
    }

    // Get recent events for this workspace
    const recentEvents = await prisma.auditEvent.findMany({
        where: {
            workspaceId: workspace.id
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 10
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{workspace.name}</h1>
                <p className="text-muted-foreground">{workspace.slug}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {workspace._count.projects}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Members
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {workspace.members.length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Retention
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {workspace.retentionDays
                                ? `${workspace.retentionDays} days`
                                : 'Inherited'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="api-keys">API Keys</TabsTrigger>
                    <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                    <TabsTrigger value="events">Recent Events</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Workspace Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <p className="text-sm font-medium">Name</p>
                                <p className="text-sm text-muted-foreground">
                                    {workspace.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Slug</p>
                                <p className="font-mono text-sm text-muted-foreground">
                                    {workspace.slug}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Company</p>
                                <p className="text-sm text-muted-foreground">
                                    {workspace.company.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Created</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(
                                        workspace.createdAt
                                    ).toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="members" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Workspace Members</CardTitle>
                            <CardDescription>
                                Users with access to this workspace
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Joined</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workspace.members.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                {member.user.name || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {member.user.email}
                                            </TableCell>
                                            <TableCell>{member.role}</TableCell>
                                            <TableCell>
                                                {new Date(
                                                    member.createdAt
                                                ).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="api-keys" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>API Keys</CardTitle>
                            <CardDescription>
                                API keys for this workspace
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Prefix</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Read Only</TableHead>
                                        <TableHead>Last Used</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workspace.apiKeys.map((key) => (
                                        <TableRow key={key.id}>
                                            <TableCell>{key.name}</TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {key.prefix}
                                            </TableCell>
                                            <TableCell>{key.type}</TableCell>
                                            <TableCell>
                                                {key.readOnly ? 'Yes' : 'No'}
                                            </TableCell>
                                            <TableCell>
                                                {key.lastUsedAt
                                                    ? new Date(
                                                          key.lastUsedAt
                                                      ).toLocaleDateString()
                                                    : 'Never'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="webhooks" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Webhooks</CardTitle>
                            <CardDescription>
                                Webhook endpoints for this workspace
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>URL</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workspace.webhooks.map((webhook) => (
                                        <TableRow key={webhook.id}>
                                            <TableCell className="font-mono text-sm">
                                                {webhook.url}
                                            </TableCell>
                                            <TableCell>
                                                {webhook.isActive
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    webhook.createdAt
                                                ).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="events" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Events</CardTitle>
                            <CardDescription>
                                Latest audit events for this workspace
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Actor</TableHead>
                                        <TableHead>Occurred</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentEvents.map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell>
                                                {event.action}
                                            </TableCell>
                                            <TableCell>
                                                {event.category}
                                            </TableCell>
                                            <TableCell>
                                                {event.actorEmail ||
                                                    event.actorId ||
                                                    'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    event.createdAt
                                                ).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
