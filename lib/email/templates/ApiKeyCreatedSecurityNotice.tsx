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

interface ApiKeyCreatedSecurityNoticeProps {
  companyName: string;
  scope: string;
  dataRegion: string;
  actorEmail: string;
  timestamp: string;
}

export const ApiKeyCreatedSecurityNotice = ({
  companyName,
  scope,
  dataRegion,
  actorEmail,
  timestamp,
}: ApiKeyCreatedSecurityNoticeProps) => {
  return (
    <Html>
      <Head />
      <Preview>New API key created for {companyName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New API Key Created</Heading>
          <Text style={text}>
            A new API key has been created for <strong>{companyName}</strong>.
          </Text>
          <Section style={details}>
            <Text style={detailRow}>
              <strong>Scope:</strong> {scope}
            </Text>
            <Text style={detailRow}>
              <strong>Data Region:</strong> {dataRegion}
            </Text>
            <Text style={detailRow}>
              <strong>Created by:</strong> {actorEmail}
            </Text>
            <Text style={detailRow}>
              <strong>Timestamp:</strong> {new Date(timestamp).toLocaleString()}
            </Text>
          </Section>
          <Text style={warning}>
            <strong>Security Notice:</strong> If you did not create this API key, please rotate it
            immediately and review your account security.
          </Text>
          <Text style={footer}>
            You can manage your API keys in the dashboard settings.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

ApiKeyCreatedSecurityNotice.PreviewProps = {
  companyName: 'Acme Corp',
  scope: 'read:events,write:events',
  dataRegion: 'US',
  actorEmail: 'admin@acme.com',
  timestamp: new Date().toISOString(),
} as ApiKeyCreatedSecurityNoticeProps;

export default ApiKeyCreatedSecurityNotice;

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

const warning = {
  color: '#d97706',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0',
  padding: '12px',
  backgroundColor: '#fef3c7',
  borderRadius: '4px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '48px',
};
