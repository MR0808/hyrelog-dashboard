import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr
} from '@react-email/components';

type Props = {
  firstName?: string;
  verifyUrl: string;
  otp: string;
  expiresMinutesMagic: number;
  expiresMinutesOtp: number;
  productName: string;
};

export function VerificationEmail({
  firstName,
  verifyUrl,
  otp,
  expiresMinutesMagic,
  expiresMinutesOtp,
  productName
}: Props) {
  const nameLine = firstName ? `Hi ${firstName},` : 'Hi,';

  return (
    <Html>
      <Head />
      <Preview>Verify your email to continue to {productName}</Preview>
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff', margin: 0 }}>
        <Container style={{ padding: '24px', maxWidth: '560px' }}>
          <Section>
            <Text style={{ fontSize: '16px', margin: '0 0 16px' }}>{nameLine}</Text>

            <Text style={{ fontSize: '16px', margin: '0 0 16px' }}>
              Click the button below to verify your email and sign in to{' '}
              <strong>{productName}</strong>.
            </Text>

            <Button
              href={verifyUrl}
              style={{
                display: 'inline-block',
                padding: '12px 16px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '16px',
                backgroundColor: '#111827',
                color: '#ffffff'
              }}
            >
              Verify email &amp; sign in
            </Button>

            <Text style={{ fontSize: '14px', margin: '16px 0 0', color: '#374151' }}>
              This link expires in {expiresMinutesMagic} minutes and can only be used once.
            </Text>

            <Hr style={{ margin: '24px 0' }} />

            <Text style={{ fontSize: '16px', margin: '0 0 8px' }}>
              Having trouble with the link?
            </Text>

            <Text style={{ fontSize: '14px', margin: '0 0 8px', color: '#374151' }}>
              Enter this code instead (expires in {expiresMinutesOtp} minutes):
            </Text>

            <Text style={{ fontSize: '24px', letterSpacing: '2px', margin: '0 0 16px' }}>
              <strong>{otp}</strong>
            </Text>

            <Hr style={{ margin: '24px 0' }} />

            <Text style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
              If you didn’t request this, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
