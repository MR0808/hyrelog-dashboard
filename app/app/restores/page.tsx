import { requireCompanyMembership } from '@/lib/rbac';
import { apiClient } from '@/lib/api/client';
import { format } from 'date-fns';
import Link from 'next/link';

export default async function RestoresPage() {
  const authContext = await requireCompanyMembership();
  const companyId = authContext.companyId!;

  let restoreRequests;
  try {
    const data = await apiClient.getRestoreRequests(companyId);
    restoreRequests = data.requests;
  } catch (error: any) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-700">Error loading restore requests: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Glacier Restore Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Restore cold archived data from Glacier. Restorations can take hours to complete.
          </p>
        </div>
        <Link
          href="/app/restores/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create Restore Request
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Archive Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estimated Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Requested
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {restoreRequests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.archive.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.tier}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      request.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : request.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : request.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.estimatedCostUsd
                    ? `$${parseFloat(request.estimatedCostUsd).toFixed(4)}`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(request.requestedAt), 'PPp')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {request.status === 'PENDING' && (
                    <button className="text-red-600 hover:text-red-900">Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
