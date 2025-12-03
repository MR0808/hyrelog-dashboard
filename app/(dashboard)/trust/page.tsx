import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TrustPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trust & Security</h1>
        <p className="text-muted-foreground">Security practices and compliance information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>How we protect your data</CardDescription>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <h3>Data Encryption</h3>
          <p>
            All data is encrypted at rest and in transit using industry-standard encryption protocols.
          </p>

          <h3>Access Control</h3>
          <p>
            Role-based access control (RBAC) ensures that only authorized users can access sensitive
            audit log data. All access attempts are logged and monitored.
          </p>

          <h3>Compliance</h3>
          <p>
            HyreLog is designed to help you meet compliance requirements including GDPR, SOC 2,
            and HIPAA. Our data residency options allow you to store data in specific regions as
            required by regulations.
          </p>

          <h3>Audit Trail</h3>
          <p>
            All changes to configuration, access patterns, and data are logged in an immutable
            audit trail using hash-chain technology.
          </p>

          <h3>Data Retention</h3>
          <p>
            You control how long data is retained. Automatic deletion policies ensure compliance
            with data retention requirements.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GDPR Compliance</CardTitle>
          <CardDescription>Data subject rights and requests</CardDescription>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <h3>Right to Access</h3>
          <p>
            Data subjects can request access to their personal data through the GDPR request system.
          </p>

          <h3>Right to Deletion</h3>
          <p>
            Data subjects can request deletion of their personal data. Requests go through a
            two-approval process to ensure accuracy.
          </p>

          <h3>Right to Anonymization</h3>
          <p>
            Instead of deletion, data can be anonymized to preserve audit trail integrity while
            removing personal identifiers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
