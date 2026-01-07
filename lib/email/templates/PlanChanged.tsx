import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface PlanChangedProps {
  companyName: string;
  oldPlan: string;
  newPlan: string;
  effectiveAt: string;
}

export const PlanChanged = ({
  companyName,
  oldPlan,
  newPlan,
  effectiveAt,
}: PlanChangedProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your HyreLog plan has changed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Plan Change Notification</Heading>
          <Text style={text}>
            Your HyreLog plan for <strong>{companyName}</strong> has been updated.
          </Text>
          <Section style={details}>
            <Text style={detailRow}>
              <strong>Previous Plan:</strong> {oldPlan}
            </Text>
            <Text style={detailRow}>
              <strong>New Plan:</strong> {newPlan}
            </Text>
            <Text style={detailRow}>
              <strong>Effective Date:</strong> {new Date(effectiveAt).toLocaleDateString()}
            </Text>
          </Section>
          <Text style={text}>
            Your new plan features and limits are now active. If you have any questions about this
            change, please contact our support team.
          </Text>
          <Text style={footer}>
            You can view your current plan and billing information in the dashboard.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

PlanChanged.PreviewProps = {
  companyName: 'Acme Corp',
  oldPlan: 'FREE',
  newPlan: 'STARTER',
  effectiveAt: new Date().toISOString(),
} as PlanChangedProps;

export default PlanChanged;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
};

const details = {
  backgroundColor: '#f6f9fc',
  padding: '16px',
  borderRadius: '4px',
  margin: '24px 0',
};

const detailRow = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '48px',
};
