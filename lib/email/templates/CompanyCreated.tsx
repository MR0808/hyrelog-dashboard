import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface CompanyCreatedProps {
  companyName: string;
  dataRegion: string;
  dashboardUrl: string;
  firstName: string;
}

export const CompanyCreated = ({
  companyName,
  dataRegion,
  dashboardUrl,
  firstName,
}: CompanyCreatedProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your HyreLog workspace is ready</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your workspace is ready!</Heading>
          <Text style={text}>Hi {firstName},</Text>
          <Text style={text}>
            Your HyreLog workspace <strong>{companyName}</strong> has been created successfully.
          </Text>
          <Text style={text}>
            <strong>Data Region:</strong> {dataRegion}
          </Text>
          <Text style={text}>
            You can now start using HyreLog to track events, create exports, and manage your data.
          </Text>
          <Section style={buttonContainer}>
            <Link style={button} href={dashboardUrl}>
              Go to Dashboard
            </Link>
          </Section>
          <Text style={footer}>
            If you have any questions, please don't hesitate to reach out to our support team.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

CompanyCreated.PreviewProps = {
  companyName: 'Acme Corp',
  dataRegion: 'US',
  dashboardUrl: 'https://dashboard.hyrelog.com',
  firstName: 'John',
} as CompanyCreatedProps;

export default CompanyCreated;

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

const buttonContainer = {
  padding: '27px 0 27px',
};

const button = {
  backgroundColor: '#5e6ad2',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '48px',
};
