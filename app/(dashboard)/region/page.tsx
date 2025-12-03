import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSelectedCompany } from '@/lib/company-context';

async function getRegionData() {
  const company = await getSelectedCompany();
  
  if (!company) {
    return {
      company: null,
      regionStores: [],
    };
  }

  const companyData = await prisma.company.findUnique({
    where: { id: company.id },
    include: {
      workspaces: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const regionStores = await prisma.regionDataStore.findMany();

  return {
    company: companyData,
    regionStores,
  };
}

export default async function RegionPage() {
  const { company, regionStores } = await getRegionData();

  if (!company) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Region & Residency</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No company data available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const regionStore = regionStores.find((rs) => rs.region === company.dataRegion);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Region & Residency</h1>
        <p className="text-muted-foreground">Configure data residency and regional settings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Data Region</CardTitle>
            <CardDescription>Primary region where your data is stored</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {company.dataRegion}
              </Badge>
            </div>
            {regionStore && (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Database:</span>{' '}
                  <span className="text-muted-foreground">{regionStore.dbUrl.split('@')[1] || 'Configured'}</span>
                </div>
                <div>
                  <span className="font-medium">Cold Storage:</span>{' '}
                  <span className="text-muted-foreground">
                    {regionStore.coldStorageProvider} - {regionStore.coldStorageBucket}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Replication Regions</CardTitle>
            <CardDescription>Regions where data is replicated</CardDescription>
          </CardHeader>
          <CardContent>
            {company.replicateTo.length === 0 ? (
              <p className="text-sm text-muted-foreground">No replication configured</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {company.replicateTo.map((region) => (
                  <Badge key={region} variant="secondary">
                    {region}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Regions</CardTitle>
          <CardDescription>All configured data regions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {regionStores.map((store) => (
              <div
                key={store.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={store.region === company.dataRegion ? 'default' : 'outline'}>
                      {store.region}
                    </Badge>
                    {store.region === company.dataRegion && (
                      <span className="text-sm text-muted-foreground">(Primary)</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {store.coldStorageProvider} - {store.coldStorageBucket}
                  </p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {store.readOnlyUrl ? 'Read Replica Available' : 'No Replica'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
