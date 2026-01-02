import { requireCompanyMembership } from '@/lib/rbac';
import { apiClient } from '@/lib/api/client';
import { format } from 'date-fns';

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const authContext = await requireCompanyMembership();
  const companyId = authContext.companyId!;

  const limit = searchParams.limit ? parseInt(searchParams.limit as string) : 50;
  const cursor = searchParams.cursor as string | undefined;

  let eventsData;
  try {
    eventsData = await apiClient.getEvents(companyId, {
      limit,
      cursor,
      from: searchParams.from as string | undefined,
      to: searchParams.to as string | undefined,
      category: searchParams.category as string | undefined,
      action: searchParams.action as string | undefined,
    });
  } catch (error: any) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-700">Error loading events: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Audit Events</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {eventsData.events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(event.timestamp), 'PPp')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {event.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.action}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.actorEmail || event.actorId || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <details>
                    <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800">
                      View
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                      {JSON.stringify(event.metadata, null, 2)}
                    </pre>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {eventsData.nextCursor && (
          <div className="px-6 py-4 border-t">
            <a
              href={`?cursor=${eventsData.nextCursor}`}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Load more →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
