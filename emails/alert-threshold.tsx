import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text
} from '@react-email/components';
import * as React from 'react';

interface AlertThresholdEmailProps {
    companyName?: string;
    meterType?: string;
    currentUsage?: number;
    threshold?: number;
    thresholdType?: 'soft' | 'hard';
    dashboardUrl?: string;
}

export const AlertThresholdEmail = ({
    companyName = 'Your company',
    meterType = 'EVENTS',
    currentUsage = 0,
    threshold = 0,
    thresholdType = 'soft',
    dashboardUrl = 'https://app.hyrelog.com/dashboard'
}: AlertThresholdEmailProps) => {
    const percentage =
        threshold > 0 ? Math.round((currentUsage / threshold) * 100) : 0;

    return (
        <Html>
            <Head />
            <Preview>
                {companyName} has reached{' '}
                {thresholdType === 'soft' ? 'soft' : 'hard'} limit for{' '}
                {meterType}
            </Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Usage Alert</Heading>
                    <Text style={text}>Hi,</Text>
                    <Text style={text}>
                        <strong>{companyName}</strong> has reached the{' '}
                        <strong>
                            {thresholdType === 'soft' ? 'soft' : 'hard'}
                        </strong>{' '}
                        limit for <strong>{meterType}</strong>.
                    </Text>
                    <Section style={statsContainer}>
                        <Text style={statLabel}>Current Usage:</Text>
                        <Text style={statValue}>
                            {currentUsage.toLocaleString()}
                        </Text>
                        <Text style={statLabel}>Threshold:</Text>
                        <Text style={statValue}>
                            {threshold.toLocaleString()}
                        </Text>
                        <Text style={statLabel}>Percentage:</Text>
                        <Text style={statValue}>{percentage}%</Text>
                    </Section>
                    {thresholdType === 'hard' && (
                        <Text style={warningText}>
                            ⚠️ You&apos;ve reached the hard limit. Some features
                            may be restricted until usage is reduced or limits
                            are increased.
                        </Text>
                    )}
                    <Section style={buttonContainer}>
                        <Link style={button} href={dashboardUrl}>
                            View Dashboard
                        </Link>
                    </Section>
                    <Text style={footer}>
                        Best regards,
                        <br />
                        The HyreLog Team
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default AlertThresholdEmail;

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif'
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px'
};

const h1 = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '40px 0',
    padding: '0'
};

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0'
};

const statsContainer = {
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    padding: '20px',
    margin: '24px 0'
};

const statLabel = {
    color: '#666',
    fontSize: '14px',
    margin: '8px 0 4px'
};

const statValue = {
    color: '#333',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 0 16px'
};

const warningText = {
    color: '#d32f2f',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0',
    padding: '12px',
    backgroundColor: '#ffebee',
    borderRadius: '4px'
};

const buttonContainer = {
    padding: '27px 0 27px'
};

const button = {
    backgroundColor: '#5e6ad2',
    borderRadius: '3px',
    color: '#fff',
    fontSize: '16px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 24px'
};

const footer = {
    color: '#898989',
    fontSize: '12px',
    lineHeight: '22px',
    marginTop: '12px',
    marginBottom: '24px'
};
