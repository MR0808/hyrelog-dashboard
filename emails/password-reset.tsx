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

interface PasswordResetEmailProps {
    resetUrl?: string;
    userName?: string;
}

export const PasswordResetEmail = ({
    resetUrl = 'https://app.hyrelog.com/reset-password',
    userName = 'there'
}: PasswordResetEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Reset your HyreLog password</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Reset Your Password</Heading>
                    <Text style={text}>Hi {userName},</Text>
                    <Text style={text}>
                        We received a request to reset your password. Click the
                        button below to create a new password:
                    </Text>
                    <Section style={buttonContainer}>
                        <Link style={button} href={resetUrl}>
                            Reset Password
                        </Link>
                    </Section>
                    <Text style={text}>
                        If you didn&apos;t request this password reset, you can
                        safely ignore this email. Your password will remain
                        unchanged.
                    </Text>
                    <Text style={text}>
                        This link will expire in 1 hour for security reasons.
                    </Text>
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

export default PasswordResetEmail;

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
