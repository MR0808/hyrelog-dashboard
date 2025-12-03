import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertSettings } from '@/components/alert-settings';
import { getSelectedCompany } from '@/lib/company-context';

async function getAlerts() {
  const company = await getSelectedCompany();
  
  if (!company) {
    return null;
  }

  const companyData = await prisma.company.findUnique({
    where: { id: company.id },
    include: {
      notificationAlerts: {
        orderBy: {
          updatedAt: 'desc',
        },
      },
      thresholdAlerts: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      },
    },
  });

  return companyData;
}

export default async function AlertsPage() {
  const data = await getAlerts();

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Alerts</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No alert data available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alerts</h1>
        <p className="text-muted-foreground">Configure and monitor threshold alerts</p>
      </div>

      <AlertSettings thresholds={data.notificationAlerts} />

      <Card>
        <CardHeader>
          <CardTitle>Recent Threshold Alerts</CardTitle>
          <CardDescription>Alerts that have been triggered</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meter Type</TableHead>
                <TableHead>Threshold Type</TableHead>
                <TableHead>Threshold Value</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Triggered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.thresholdAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No alerts triggered
                  </TableCell>
                </TableRow>
              ) : (
                data.thresholdAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>{alert.meterType}</TableCell>
                    <TableCell>{alert.thresholdType}</TableCell>
                    <TableCell>{alert.thresholdValue.toLocaleString()}</TableCell>
                    <TableCell>{alert.currentValue.toLocaleString()}</TableCell>
                    <TableCell>{new Date(alert.createdAt).toLocaleString()}</TableCell>
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
