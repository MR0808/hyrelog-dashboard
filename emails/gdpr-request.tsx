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

interface GdprRequestEmailProps {
  requestType?: 'DELETE' | 'ANONYMIZE';
  requestId?: string;
  status?: string;
  dashboardUrl?: string;
}

export const GdprRequestEmail = ({
  requestType = 'DELETE',
  requestId = '',
  status = 'PROCESSING',
  dashboardUrl = 'https://app.hyrelog.com/gdpr',
}: GdprRequestEmailProps) => {
  const isComplete = status === 'DONE';
  const requestTypeLabel = requestType === 'DELETE' ? 'Deletion' : 'Anonymization';
  
  return (
    <Html>
      <Head />
      <Preview>
        GDPR {requestTypeLabel} Request {isComplete ? 'Completed' : 'Update'}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            GDPR {requestTypeLabel} Request {isComplete ? 'Completed' : 'Update'}
          </Heading>
          <Text style={text}>
            Hi,
          </Text>
          <Text style={text}>
            Your GDPR {requestTypeLabel.toLowerCase()} request{' '}
            {requestId && <strong>(ID: {requestId})</strong>} has been{' '}
            {isComplete ? 'completed' : 'updated'}.
          </Text>
          {isComplete ? (
            <>
              <Text style={text}>
                All requested data has been{' '}
                {requestType === 'DELETE' ? 'deleted' : 'anonymized'} in
                accordance with GDPR regulations.
              </Text>
              <Text style={text}>
                If you have any questions or concerns, please contact our
                support team.
              </Text>
            </>
          ) : (
            <Text style={text}>
              Current status: <strong>{status}</strong>
            </Text>
          )}
          <Section style={buttonContainer}>
            <Link style={button} href={dashboardUrl}>
              View Request Status
            </Link>
          </Section>
          <Text style={footer}>
            Best regards,<br />
            The HyreLog Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default GdprRequestEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
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
  margin: '16px 0',
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
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
};

