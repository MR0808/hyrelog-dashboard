import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from '@/components/charts/line-chart';
import {
  BarChart,
  Bar,
} from '@/components/charts/bar-chart';
import { getSelectedCompany } from '@/lib/company-context';

async function getOverviewData() {
  // Get selected company from context
  const company = await getSelectedCompany();
  
  if (!company) {
    return null;
  }

  const companyData = await prisma.company.findUnique({
    where: { id: company.id },
    include: {
      plans: {
        include: {
          plan: true,
        },
      },
      workspaces: {
        select: {
          id: true,
        },
      },
      billingMeters: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
      usageStats: {
        orderBy: {
          periodStart: 'desc',
        },
        take: 30,
      },
      thresholdAlerts: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      },
    },
  });

  return companyData;
}

export default async function OverviewPage() {
  const data = await getOverviewData();

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Overview</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No data available. Please configure your company.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const plan = data.plans?.plan;
  const usageData = data.usageStats.map((stat) => ({
    date: new Date(stat.periodStart).toLocaleDateString(),
    ingested: stat.eventsIngested,
    queried: stat.eventsQueried,
  }));

  const meterData = data.billingMeters.map((meter) => ({
    name: meter.meterType,
    value: meter.currentValue,
    limit: meter.limit,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your audit logs.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plan?.name || 'No Plan'}</div>
            <p className="text-xs text-muted-foreground">
              {plan?.monthlyEventLimit.toLocaleString()} events/month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.retentionDays} days</div>
            <p className="text-xs text-muted-foreground">Data retention period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workspaces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.workspaces?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active workspaces</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.thresholdAlerts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Threshold alerts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage Over Time</CardTitle>
            <CardDescription>Events ingested and queried</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="ingested" stroke="#8884d8" name="Ingested" />
                <Line type="monotone" dataKey="queried" stroke="#82ca9d" name="Queried" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Meters</CardTitle>
            <CardDescription>Current usage vs limits</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={meterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" name="Current" />
                <Bar dataKey="limit" fill="#82ca9d" name="Limit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {data.thresholdAlerts && data.thresholdAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Threshold alerts that require attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.thresholdAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{alert.meterType}</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.currentValue} / {alert.thresholdValue}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
