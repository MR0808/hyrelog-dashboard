import { prisma } from '@/lib/prisma';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from '@/components/charts/line-chart';
import { BarChart, Bar } from '@/components/charts/bar-chart';
import { getSelectedCompany } from '@/lib/company-context';

async function getBillingData() {
    const company = await getSelectedCompany();

    if (!company) {
        return null;
    }

    const companyData = await prisma.company.findUnique({
        where: { id: company.id },
        include: {
            plans: {
                include: {
                    plan: true
                }
            },
            addOns: {
                include: {
                    addOn: true
                }
            },
            billingMeters: {
                orderBy: {
                    createdAt: 'desc'
                },
                take: 12
            },
            usageStats: {
                orderBy: {
                    periodStart: 'desc'
                },
                take: 12
            }
        }
    });

    return companyData;
}

export default async function BillingPage() {
    const data = await getBillingData();

    if (!data) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Usage & Billing</h1>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">
                            No billing data available.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const plan = data.plans?.plan;
    const usageData = data.usageStats.reverse().map((stat) => ({
        period: new Date(stat.periodStart).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        }),
        ingested: stat.eventsIngested,
        queried: stat.eventsQueried
    }));

    const meterData = data.billingMeters.map((meter) => ({
        name: meter.meterType,
        current: meter.currentValue,
        limit: meter.limit,
        usage: (meter.currentValue / meter.limit) * 100
    }));

    // Calculate the maximum limit for Y-axis domain
    const maxLimit =
        meterData.length > 0 ? Math.max(...meterData.map((d) => d.limit)) : 100;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Usage & Billing</h1>
                <p className="text-muted-foreground">
                    Monitor your usage and billing information
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Current Plan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {plan?.name || 'No Plan'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {plan?.monthlyEventLimit.toLocaleString()}{' '}
                            events/month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Monthly Cost
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${((plan?.priceCents || 0) / 100).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {data.plans?.billingCycle === 'ANNUAL'
                                ? 'per year'
                                : 'per month'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Add-ons
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data.addOns.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Active add-ons
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Usage Over Time</CardTitle>
                    <CardDescription>
                        Events ingested and queried by period
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={usageData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="ingested"
                                stroke="#8884d8"
                                name="Ingested"
                            />
                            <Line
                                type="monotone"
                                dataKey="queried"
                                stroke="#82ca9d"
                                name="Queried"
                            />
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
                    <div className="space-y-4">
                        {meterData.map((meter) => {
                            const percentage = meter.usage;
                            const isNearLimit = percentage >= 80;
                            const isAtLimit = percentage >= 100;

                            return (
                                <div key={meter.name} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">
                                            {meter.name}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {meter.current.toLocaleString()} /{' '}
                                            {meter.limit.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={`h-full transition-all ${
                                                isAtLimit
                                                    ? 'bg-red-500'
                                                    : isNearLimit
                                                      ? 'bg-yellow-500'
                                                      : 'bg-green-500'
                                            }`}
                                            style={{
                                                width: `${Math.min(percentage, 100)}%`
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>
                                            {percentage.toFixed(1)}% used
                                        </span>
                                        <span>
                                            {(
                                                meter.limit - meter.current
                                            ).toLocaleString()}{' '}
                                            remaining
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {data.addOns.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Active Add-ons</CardTitle>
                        <CardDescription>
                            Additional features and capacity
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.addOns.map((addOn) => (
                                <div
                                    key={addOn.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {addOn.addOn.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {addOn.addOn.description}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">
                                            $
                                            {(
                                                (addOn.addOn.priceCents *
                                                    addOn.quantity) /
                                                100
                                            ).toFixed(2)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Qty: {addOn.quantity}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
