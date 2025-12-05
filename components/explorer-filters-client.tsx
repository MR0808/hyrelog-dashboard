'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Workspace {
    id: string;
    name: string;
    slug: string;
}

export function ExplorerFiltersClient({
    workspaces,
    searchParams
}: {
    workspaces: Workspace[];
    searchParams: Record<string, string | undefined>;
}) {
    const router = useRouter();
    const [filters, setFilters] = useState({
        workspaceId: searchParams.workspaceId || '',
        actorEmail: searchParams.actorEmail || '',
        action: searchParams.action || '',
        category: searchParams.category || '',
        startDate: searchParams.startDate || '',
        endDate: searchParams.endDate || ''
    });

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleApplyFilters = () => {
        const newParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                newParams.set(key, value);
            }
        });
        router.push(`/explorer?${newParams.toString()}`);
    };

    const handleClearFilters = () => {
        setFilters({
            workspaceId: '',
            actorEmail: '',
            action: '',
            category: '',
            startDate: '',
            endDate: ''
        });
        router.push('/explorer');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="workspace">Workspace</Label>
                        <Select
                            value={filters.workspaceId || 'all'}
                            onValueChange={(value) =>
                                handleFilterChange(
                                    'workspaceId',
                                    value === 'all' ? '' : value
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All workspaces" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All workspaces
                                </SelectItem>
                                {workspaces.map((ws) => (
                                    <SelectItem key={ws.id} value={ws.id}>
                                        {ws.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="actorEmail">Actor Email</Label>
                        <Input
                            id="actorEmail"
                            placeholder="user@example.com"
                            value={filters.actorEmail}
                            onChange={(e) =>
                                handleFilterChange('actorEmail', e.target.value)
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="action">Action</Label>
                        <Input
                            id="action"
                            placeholder="e.g., user.created"
                            value={filters.action}
                            onChange={(e) =>
                                handleFilterChange('action', e.target.value)
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                            id="category"
                            placeholder="e.g., user"
                            value={filters.category}
                            onChange={(e) =>
                                handleFilterChange('category', e.target.value)
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={filters.startDate}
                            onChange={(e) =>
                                handleFilterChange('startDate', e.target.value)
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={filters.endDate}
                            onChange={(e) =>
                                handleFilterChange('endDate', e.target.value)
                            }
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button onClick={handleApplyFilters}>Apply Filters</Button>
                    <Button variant="outline" onClick={handleClearFilters}>
                        Clear
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
