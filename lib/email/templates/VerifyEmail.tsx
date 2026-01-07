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

interface VerifyEmailProps {
  verificationUrl: string;
  firstName: string;
}

export const VerifyEmail = ({ verificationUrl, firstName }: VerifyEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your email to activate HyreLog</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verify your email</Heading>
          <Text style={text}>Hi {firstName},</Text>
          <Text style={text}>
            Welcome to HyreLog! Please verify your email address to activate your account and start
            using our services.
          </Text>
          <Text style={text}>
            Email verification is required before you can create API keys or send events.
          </Text>
          <Section style={buttonContainer}>
            <Link style={button} href={verificationUrl}>
              Verify Email Address
            </Link>
          </Section>
          <Text style={text}>
            This link will expire in 24 hours. If you didn't create an account, you can safely
            ignore this email.
          </Text>
          <Text style={footer}>
            If the button doesn't work, copy and paste this link into your browser:{' '}
            <Link href={verificationUrl} style={link}>
              {verificationUrl}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

VerifyEmail.PreviewProps = {
  verificationUrl: 'https://dashboard.hyrelog.com/verify-email?token=abc123',
  firstName: 'John',
} as VerifyEmailProps;

export default VerifyEmail;

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
