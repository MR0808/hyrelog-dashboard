'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Settings,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import type { Workspace, WorkspacesContentProps } from '@/types/workspace';
import {
  DATA_REGION_OPTIONS,
  WORKSPACE_STATUS_OPTIONS,
  getDataRegionLabel,
  getWorkspaceStatusLabel
} from '@/lib/constants/regions';

type SortKey = 'name' | 'slug' | 'preferredRegion' | 'members' | 'status';
type SortDir = 'asc' | 'desc';
type PageSize = 10 | 20 | 50 | 'all';

const PAGE_SIZE_OPTIONS: { value: PageSize; label: string }[] = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
  { value: 'all', label: 'All' }
];

function SortHeader({
  columnKey,
  sortKey,
  sortDir,
  onSort,
  children
}: {
  columnKey: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  children: React.ReactNode;
}) {
  return (
    <TableHead>
      <button
        type="button"
        className="flex items-center gap-1 hover:text-foreground font-medium"
        onClick={() => onSort(columnKey)}
      >
        {children}
        {sortKey === columnKey ? (
          sortDir === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        ) : null}
      </button>
    </TableHead>
  );
}

function sortWorkspaces(workspaces: Workspace[], sortKey: SortKey, sortDir: SortDir): Workspace[] {
  const dir = sortDir === 'asc' ? 1 : -1;
  return [...workspaces].sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;
    switch (sortKey) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'slug':
        aVal = a.slug.toLowerCase();
        bVal = b.slug.toLowerCase();
        break;
      case 'preferredRegion':
        aVal = (a.preferredRegion ?? '').toLowerCase();
        bVal = (b.preferredRegion ?? '').toLowerCase();
        break;
      case 'members':
        aVal = a._count?.members ?? 0;
        bVal = b._count?.members ?? 0;
        break;
      case 'status':
        aVal = 'ACTIVE';
        bVal = 'ACTIVE';
        break;
      default:
        return 0;
    }
    if (aVal < bVal) return -dir;
    if (aVal > bVal) return dir;
    return 0;
  });
}

const ALL_REGION = '';
const ALL_STATUS = '';

export function WorkspacesContent({ workspaces, isAdmin }: WorkspacesContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState<string>(ALL_REGION);
  const [filterStatus, setFilterStatus] = useState<string>(ALL_STATUS);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [page, setPage] = useState(1);

  console.log(workspaces);

  const filteredWorkspaces = useMemo(
    () =>
      workspaces.filter((workspace) => {
        const matchesSearch =
          workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          workspace.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRegion =
          filterRegion === ALL_REGION || (workspace.preferredRegion ?? '') === filterRegion;
        const matchesStatus =
          filterStatus === ALL_STATUS || (workspace.status ?? 'ACTIVE') === filterStatus;
        return matchesSearch && matchesRegion && matchesStatus;
      }),
    [workspaces, searchQuery, filterRegion, filterStatus]
  );

  const sortedWorkspaces = useMemo(
    () => sortWorkspaces(filteredWorkspaces, sortKey, sortDir),
    [filteredWorkspaces, sortKey, sortDir]
  );

  const totalCount = sortedWorkspaces.length;
  const pageCount = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(totalCount / pageSize));
  const effectivePage = Math.min(page, pageCount);
  const startIndex = pageSize === 'all' ? 0 : (effectivePage - 1) * pageSize;
  const endIndex = pageSize === 'all' ? totalCount : Math.min(startIndex + pageSize, totalCount);

  const paginatedWorkspaces = useMemo(
    () => sortedWorkspaces.slice(startIndex, endIndex),
    [sortedWorkspaces, startIndex, endIndex]
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Workspaces</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and organize your audit logging workspaces
            </p>
          </div>
          {!isAdmin && (
            <Button className="bg-brand-500 hover:bg-brand-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create workspace
            </Button>
          )}
        </div>

        {/* Search and filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filterRegion === ALL_REGION ? 'all' : filterRegion}
                onValueChange={(v) => {
                  setFilterRegion(v === 'all' ? ALL_REGION : v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All regions</SelectItem>
                  {DATA_REGION_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filterStatus === ALL_STATUS ? 'all' : filterStatus}
                onValueChange={(v) => {
                  setFilterStatus(v === 'all' ? ALL_STATUS : v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {WORKSPACE_STATUS_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Workspaces table */}
        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHeader
                    columnKey="name"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  >
                    Name
                  </SortHeader>
                  <SortHeader
                    columnKey="slug"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  >
                    Slug
                  </SortHeader>
                  <SortHeader
                    columnKey="preferredRegion"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  >
                    Region
                  </SortHeader>
                  <SortHeader
                    columnKey="members"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  >
                    Members
                  </SortHeader>
                  <SortHeader
                    columnKey="status"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                  >
                    Status
                  </SortHeader>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkspaces.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-muted-foreground"
                    >
                      {workspaces.length > 0
                        ? 'No workspaces match your search and filters'
                        : 'No workspaces yet'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedWorkspaces.map((workspace) => (
                    <TableRow
                      key={workspace.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <Link
                          href={`/workspaces/${workspace.company.slug}-${workspace.slug}`}
                          className="block hover:underline focus:underline focus:outline-none"
                        >
                          {workspace.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <Link
                          href={`/workspaces/${workspace.company.slug}-${workspace.slug}`}
                          className="block hover:underline focus:underline focus:outline-none"
                        >
                          {workspace.slug}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/workspaces/${workspace.company.slug}-${workspace.slug}`}
                          className="block hover:underline focus:underline focus:outline-none"
                        >
                          <span className="text-sm text-muted-foreground">
                            {getDataRegionLabel(workspace.preferredRegion)}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/workspaces/${workspace.company.slug}-${workspace.slug}`}
                          className="block hover:underline focus:underline focus:outline-none"
                        >
                          {workspace._count?.members ?? 0}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/workspaces/${workspace.company.slug}-${workspace.slug}`}
                          className="block hover:underline focus:underline focus:outline-none"
                        >
                          <Badge
                            variant={workspace.status === 'ACTIVE' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {getWorkspaceStatusLabel(workspace.status)}
                          </Badge>
                        </Link>
                      </TableCell>
                      <TableCell className="w-[50px]">
                        {isAdmin ||
                        (workspace.myWorkspaceRole &&
                          (workspace.myWorkspaceRole === 'ADMIN' ||
                            workspace.myWorkspaceRole === 'WRITER')) ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {(isAdmin ||
                                (workspace.myWorkspaceRole &&
                                  (workspace.myWorkspaceRole === 'ADMIN' ||
                                    workspace.myWorkspaceRole === 'WRITER'))) && (
                                <DropdownMenuItem className="cursor-pointer">
                                  <Settings className="h-4 w-4 mr-2" />
                                  Settings
                                </DropdownMenuItem>
                              )}
                              {(isAdmin ||
                                (workspace.myWorkspaceRole &&
                                  workspace.myWorkspaceRole === 'ADMIN')) && (
                                <DropdownMenuItem className="text-destructive cursor-pointer">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <div className="p-3"></div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {filteredWorkspaces.length > 0 && (
              <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {pageSize === 'all'
                      ? `Showing all ${totalCount}`
                      : `Showing ${startIndex + 1}–${endIndex} of ${totalCount}`}
                  </span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => {
                      setPageSize(v === 'all' ? 'all' : (Number(v) as 10 | 20 | 50));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Per page" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((opt) => (
                        <SelectItem
                          key={String(opt.value)}
                          value={String(opt.value)}
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">per page</span>
                </div>
                {pageSize !== 'all' &&
                  pageCount > 1 &&
                  (() => {
                    const WINDOW = 4;
                    let startPage = Math.max(1, effectivePage - Math.floor(WINDOW / 2));
                    let endPage = Math.min(pageCount, startPage + WINDOW - 1);
                    if (endPage - startPage + 1 < WINDOW) {
                      startPage = Math.max(1, endPage - WINDOW + 1);
                    }
                    const pageNumbers = Array.from(
                      { length: endPage - startPage + 1 },
                      (_, i) => startPage + i
                    );
                    return (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPage(1)}
                          disabled={effectivePage <= 1}
                          title="First page"
                        >
                          <ChevronsLeft className="h-4 w-4" />
                          <span className="sr-only">First page</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={effectivePage <= 1}
                          title="Previous page"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="sr-only">Previous page</span>
                        </Button>
                        <div className="flex items-center gap-1 px-1">
                          {pageNumbers.map((num) => (
                            <Button
                              key={num}
                              variant={effectivePage === num ? 'default' : 'outline'}
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setPage(num)}
                            >
                              {num}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                          disabled={effectivePage >= pageCount}
                          title="Next page"
                        >
                          <ChevronRight className="h-4 w-4" />
                          <span className="sr-only">Next page</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPage(pageCount)}
                          disabled={effectivePage >= pageCount}
                          title="Last page"
                        >
                          <ChevronsRight className="h-4 w-4" />
                          <span className="sr-only">Last page</span>
                        </Button>
                      </div>
                    );
                  })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
