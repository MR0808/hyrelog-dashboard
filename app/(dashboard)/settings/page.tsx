import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CompanySettings } from '@/components/company-settings';
import { getSelectedCompany } from '@/lib/company-context';

async function getCompanySettings() {
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
    },
  });

  return companyData;
}

export default async function SettingsPage() {
  const company = await getCompanySettings();

  if (!company) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No company data available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your company and workspace settings</p>
      </div>

      <CompanySettings company={company} />
    </div>
  );
}
