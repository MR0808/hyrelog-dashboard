'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  MoreVertical,
  Settings,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
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

export function WorkspacesContent({ workspaces, isAdmin, createButton }: WorkspacesContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegions, setFilterRegions] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [page, setPage] = useState(1);

  const hasActiveFilters =
    searchQuery.trim() !== '' || filterRegions.length > 0 || filterStatuses.length > 0;

  const filteredWorkspaces = useMemo(
    () =>
      workspaces.filter((workspace) => {
        const matchesSearch =
          workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          workspace.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRegion =
          filterRegions.length === 0 ||
          (workspace.preferredRegion != null && filterRegions.includes(workspace.preferredRegion));
        const matchesStatus =
          filterStatuses.length === 0 ||
          (workspace.status != null && filterStatuses.includes(workspace.status));
        return matchesSearch && matchesRegion && matchesStatus;
      }),
    [workspaces, searchQuery, filterRegions, filterStatuses]
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

  const toggleRegion = (value: string) => {
    setFilterRegions((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
    setPage(1);
  };

  const toggleStatus = (value: string) => {
    setFilterStatuses((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterRegions([]);
    setFilterStatuses([]);
    setPage(1);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="space-y-4 sm:space-y-6">
        {/* Header: stacked on mobile, row on desktop */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div key="workspaces-header-title">
            <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Workspaces</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and organize your audit logging workspaces
            </p>
          </div>
          {createButton != null ? (
            <div key="workspaces-header-action" className="w-full sm:w-auto">
              {createButton}
            </div>
          ) : null}
        </div>

        {/* Search and filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="relative w-full min-w-0 flex-1 sm:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search workspaces..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full min-w-[120px] sm:w-[160px] justify-between font-normal"
                  >
                    <span className="truncate">
                      {filterRegions.length === 0
                        ? 'All regions'
                        : filterRegions.length === 1
                          ? getDataRegionLabel(filterRegions[0])
                          : `${filterRegions.length} regions`}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-2" align="start">
                  <div className="flex flex-col gap-1.5 max-h-[280px] overflow-y-auto">
                    {DATA_REGION_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
                      >
                        <Checkbox
                          checked={filterRegions.includes(opt.value)}
                          onCheckedChange={() => toggleRegion(opt.value)}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full min-w-[120px] sm:w-[140px] justify-between font-normal"
                  >
                    <span className="truncate">
                      {filterStatuses.length === 0
                        ? 'All statuses'
                        : filterStatuses.length === 1
                          ? getWorkspaceStatusLabel(filterStatuses[0])
                          : `${filterStatuses.length} statuses`}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-2" align="start">
                  <div className="flex flex-col gap-1.5">
                    {WORKSPACE_STATUS_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
                      >
                        <Checkbox
                          checked={filterStatuses.includes(opt.value)}
                          onCheckedChange={() => toggleStatus(opt.value)}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Clear filters
                </Button>
              )}
            </div>
            {/* Selected filter tags */}
            {(filterRegions.length > 0 || filterStatuses.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
                {filterRegions.map((value) => (
                  <Badge
                    key={`region-${value}`}
                    variant="secondary"
                    className="pl-2.5 pr-1 py-1 gap-1 font-normal"
                  >
                    {getDataRegionLabel(value)}
                    <button
                      type="button"
                      onClick={() => toggleRegion(value)}
                      aria-label={`Remove region ${getDataRegionLabel(value)}`}
                      className="rounded-full p-0.5 hover:bg-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {filterStatuses.map((value) => (
                  <Badge
                    key={`status-${value}`}
                    variant="secondary"
                    className="pl-2.5 pr-1 py-1 gap-1 font-normal"
                  >
                    {getWorkspaceStatusLabel(value)}
                    <button
                      type="button"
                      onClick={() => toggleStatus(value)}
                      aria-label={`Remove status ${getWorkspaceStatusLabel(value)}`}
                      className="rounded-full p-0.5 hover:bg-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workspaces table: horizontal scroll on small screens */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <Table className="min-w-[600px]">
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
            </div>

            {/* Pagination */}
            {filteredWorkspaces.length > 0 && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
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
                    <SelectTrigger className="w-full min-w-[80px] sm:w-[100px]">
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
