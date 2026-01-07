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

interface InviteUserProps {
  companyName: string;
  role: string;
  acceptUrl: string;
  expiresAt: string;
  inviterName: string;
}

export const InviteUser = ({
  companyName,
  role,
  acceptUrl,
  expiresAt,
  inviterName,
}: InviteUserProps) => {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join {companyName} on HyreLog</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>You've been invited!</Heading>
          <Text style={text}>
            <strong>{inviterName}</strong> has invited you to join <strong>{companyName}</strong>{' '}
            on HyreLog.
          </Text>
          <Text style={text}>
            <strong>Role:</strong> {role === 'COMPANY_ADMIN' ? 'Company Admin' : 'Company Member'}
          </Text>
          <Section style={buttonContainer}>
            <Link style={button} href={acceptUrl}>
              Accept Invitation
            </Link>
          </Section>
          <Text style={text}>
            This invitation will expire on {new Date(expiresAt).toLocaleDateString()}. If you
            didn't expect this invitation, you can safely ignore this email.
          </Text>
          <Text style={footer}>
            If the button doesn't work, copy and paste this link into your browser:{' '}
            <Link href={acceptUrl} style={link}>
              {acceptUrl}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

InviteUser.PreviewProps = {
  companyName: 'Acme Corp',
  role: 'COMPANY_MEMBER',
  acceptUrl: 'https://dashboard.hyrelog.com/accept-invite?token=abc123',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  inviterName: 'John Doe',
} as InviteUserProps;

export default InviteUser;

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

const link = {
  color: '#5e6ad2',
  textDecoration: 'underline',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '48px',
};
