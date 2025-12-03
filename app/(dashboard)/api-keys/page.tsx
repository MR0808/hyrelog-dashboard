import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreateApiKey } from '@/components/create-api-key';
import { ApiKeyActions } from '@/components/api-key-actions';
import { getCompanyFilter } from '@/lib/company-context';

async function getApiKeys() {
  const companyFilter = await getCompanyFilter();
  
  const apiKeys = await prisma.apiKey.findMany({
    where: companyFilter,
    include: {
      company: {
        select: {
          name: true,
        },
      },
      workspace: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return apiKeys;
}

export default async function ApiKeysPage() {
  const apiKeys = await getApiKeys();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">Manage your API keys for authentication</p>
        </div>
        <CreateApiKey />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>All API keys for your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Workspace</TableHead>
                <TableHead>Read Only</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No API keys found
                  </TableCell>
                </TableRow>
              ) : (
                apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell className="font-mono text-sm">{key.prefix}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{key.type}</Badge>
                    </TableCell>
                    <TableCell>{key.workspace?.name || 'Company-wide'}</TableCell>
                    <TableCell>{key.readOnly ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <Badge variant={key.revokedAt ? 'destructive' : 'default'}>
                        {key.revokedAt ? 'Revoked' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <ApiKeyActions keyId={key.id} keyName={key.name} />
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
