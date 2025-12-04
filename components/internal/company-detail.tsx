import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CompanyDetailProps {
  company: any; // Using any due to schema fields that may not exist yet
}

export function CompanyDetail({ company }: CompanyDetailProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Name</div>
            <div className="font-medium">{company.name}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Slug</div>
            <div className="font-mono text-sm">{company.slug}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Data Region</div>
            <div className="font-medium">{company.dataRegion}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Retention Days</div>
            <div className="font-medium">{company.retentionDays} days</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Billing Mode</div>
            <Badge variant={company.billingMode === 'CUSTOM' ? 'default' : 'secondary'}>
              {company.billingMode || 'STRIPE'}
            </Badge>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Created</div>
            <div className="font-medium">
              {new Date(company.createdAt).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Total Events</div>
            <div className="text-2xl font-bold">{company._count.auditEvents.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Workspaces</div>
            <div className="text-2xl font-bold">{company._count.workspaces}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Members</div>
            <div className="text-2xl font-bold">{company._count.members}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Plan Information</CardTitle>
        </CardHeader>
        <CardContent>
          {company.plans ? (
            <div className="space-y-2">
              <div className="font-medium">{company.plans.plan.name}</div>
              <div className="text-sm text-muted-foreground">
                {company.plans.plan.monthlyEventLimit.toLocaleString()} events/month
              </div>
              <div className="text-sm text-muted-foreground">
                Billing: {company.plans.billingCycle}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">No plan assigned</div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>Company members and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {company.members.map((member: any) => (
                <TableRow key={member.id}>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell>{member.user.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{member.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(member.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

