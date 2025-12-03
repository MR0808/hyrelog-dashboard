'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface PaginationClientProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
}

export function PaginationClient({ currentPage, totalPages, baseUrl }: PaginationClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${baseUrl || '/explorer'}?${params.toString()}`);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex gap-2">
        {currentPage > 1 && (
          <Button variant="outline" onClick={() => navigateToPage(currentPage - 1)}>
            Previous
          </Button>
        )}
        {currentPage < totalPages && (
          <Button variant="outline" onClick={() => navigateToPage(currentPage + 1)}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}

