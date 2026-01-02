import { requireCompanyMembership } from '@/lib/rbac';
import { apiClient } from '@/lib/api/client';
import { format } from 'date-fns';
import Link from 'next/link';

export default async function ExportsPage() {
  const authContext = await requireCompanyMembership();
  const companyId = authContext.companyId!;

  // In a real implementation, you'd fetch export jobs from the API
  // For now, show a placeholder
  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Exports</h1>
        <Link
          href="/app/exports/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create Export
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">
          Export functionality will be available here. Create export jobs to download your audit
          event data.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Note: This page is a placeholder. Full implementation would list export jobs and allow
          downloading completed exports.
        </p>
      </div>
    </div>
  );
}
