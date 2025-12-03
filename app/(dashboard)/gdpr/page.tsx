import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CreateGdprRequest } from '@/components/create-gdpr-request';
import { Badge } from '@/components/ui/badge';
import { getSelectedCompany } from '@/lib/company-context';

async function getGdprRequests() {
  const company = await getSelectedCompany();
  
  if (!company) {
    return [];
  }

  const companyData = await prisma.company.findUnique({
    where: { id: company.id },
    include: {
      gdprRequests: {
        include: {
          approvals: {
            include: {
              request: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  return companyData?.gdprRequests || [];
}

function getStatusBadge(status: string) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    CUSTOMER_PENDING: 'default',
    CUSTOMER_APPROVED: 'secondary',
    ADMIN_PENDING: 'default',
    ADMIN_APPROVED: 'secondary',
    PROCESSING: 'secondary',
    DONE: 'outline',
    REJECTED: 'destructive',
  };

  return variants[status] || 'default';
}

export default async function GdprPage() {
  const requests = await getGdprRequests();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GDPR Requests</h1>
          <p className="text-muted-foreground">Manage data subject access and deletion requests</p>
        </div>
        <CreateGdprRequest />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>GDPR Requests</CardTitle>
          <CardDescription>All data subject requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request Type</TableHead>
                <TableHead>Actor Email</TableHead>
                <TableHead>Actor ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Approvals</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No GDPR requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.requestType}</TableCell>
                    <TableCell>{request.actorEmail || 'N/A'}</TableCell>
                    <TableCell className="font-mono text-sm">{request.actorId || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(request.status)}>{request.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(request.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{request.approvals.length}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
