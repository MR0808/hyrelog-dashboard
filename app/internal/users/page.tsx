import { requireInternalAuth } from '@/lib/internal-auth';
import { prisma } from '@/lib/prisma';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default async function InternalUsersPage({
    searchParams
}: {
    searchParams: Promise<{ search?: string }>;
}) {
    await requireInternalAuth();
    const resolvedSearchParams = await searchParams;

    const where: any = {};

    if (resolvedSearchParams.search) {
        where.OR = [
            {
                email: {
                    contains: resolvedSearchParams.search,
                    mode: 'insensitive'
                }
            },
            {
                name: {
                    contains: resolvedSearchParams.search,
                    mode: 'insensitive'
                }
            }
        ];
    }

    const users = await prisma.user.findMany({
        where,
        include: {
            companies: {
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            },
            _count: {
                select: {
                    companies: true,
                    workspaces: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 100
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Users</h1>
                <p className="text-muted-foreground">
                    View and manage all customer users
                </p>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Companies</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center text-muted-foreground"
                                >
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.email}
                                    </TableCell>
                                    <TableCell>{user.name || 'N/A'}</TableCell>
                                    <TableCell>
                                        {user._count.companies}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            user.createdAt
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="text-sm text-muted-foreground">
                                            {user.companies
                                                .map((cu) => cu.company.name)
                                                .join(', ')}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
