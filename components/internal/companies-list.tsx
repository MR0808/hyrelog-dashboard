'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Building2 } from 'lucide-react';

interface Company {
    id: string;
    name: string;
    slug: string;
    // @ts-ignore
    billingMode?: string;
    createdAt: Date;
    members: Array<{
        user: {
            email: string;
            name: string | null;
        };
    }>;
    plans: {
        plan: {
            name: string;
            code: string;
        };
    } | null;
    _count: {
        workspaces: number;
        members: number;
    };
}

interface CompaniesListProps {
    companies: Company[];
}

export function CompaniesList({ companies }: CompaniesListProps) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [billingMode, setBillingMode] = useState<string>('');

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (billingMode) params.set('billingMode', billingMode);
        router.push(`/internal/companies?${params.toString()}`);
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search companies..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && handleSearch()
                            }
                            className="pl-9"
                        />
                    </div>
                </div>
                <Select value={billingMode} onValueChange={setBillingMode}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Billing Mode" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Modes</SelectItem>
                        <SelectItem value="STRIPE">Stripe</SelectItem>
                        <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={handleSearch}>Search</Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Company</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Billing</TableHead>
                            <TableHead>Workspaces</TableHead>
                            <TableHead>Members</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companies.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="text-center text-muted-foreground"
                                >
                                    No companies found
                                </TableCell>
                            </TableRow>
                        ) : (
                            companies.map((company) => (
                                <TableRow key={company.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">
                                                    {company.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {company.slug}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {company.members[0]?.user.email ||
                                            'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {company.plans?.plan.name || (
                                            <Badge variant="secondary">
                                                No Plan
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                company.billingMode === 'CUSTOM'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {company.billingMode || 'STRIPE'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {company._count.workspaces}
                                    </TableCell>
                                    <TableCell>
                                        {company._count.members}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            company.createdAt
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={`/internal/companies/${company.id}`}
                                            >
                                                View
                                            </Link>
                                        </Button>
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
