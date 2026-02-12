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
  inviterName: string;
  inviteLink: string;
  scope: 'company' | 'workspace';
  targetName: string;
  companyName?: string;
  role: string;
  expiresInDays: number;
  productName: string;
};

export function InviteEmail({
  inviterName,
  inviteLink,
  scope,
  targetName,
  companyName,
  role,
  expiresInDays,
  productName
}: Props) {
  const scopeLabel = scope === 'company' ? 'company' : 'workspace';
  const targetLine =
    scope === 'company'
      ? `You've been invited to join ${targetName} as ${role}.`
      : companyName
        ? `You've been invited to the workspace ${targetName} (${companyName}) as ${role}.`
        : `You've been invited to the workspace ${targetName} as ${role}.`;

  return (
    <Html>
      <Head />
      <Preview>
        {inviterName} invited you to join {targetName} on {productName}
      </Preview>
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff', margin: 0 }}>
        <Container style={{ padding: '24px', maxWidth: '560px' }}>
          <Section>
            <Text style={{ fontSize: '16px', margin: '0 0 16px' }}>Hi,</Text>

            <Text style={{ fontSize: '16px', margin: '0 0 16px' }}>
              <strong>{inviterName}</strong> has invited you to join their {scopeLabel} on{' '}
              <strong>{productName}</strong>.
            </Text>

            <Text style={{ fontSize: '16px', margin: '0 0 16px' }}>{targetLine}</Text>

            <Button
              href={inviteLink}
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
              Accept invite
            </Button>

            <Text style={{ fontSize: '14px', margin: '16px 0 0', color: '#374151' }}>
              This invite expires in {expiresInDays} day{expiresInDays !== 1 ? 's' : ''}. If you
              don&apos;t have an account, you&apos;ll be able to sign up when you accept.
            </Text>

            <Hr style={{ margin: '24px 0' }} />

            <Text style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
              If you weren&apos;t expecting this invite, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
