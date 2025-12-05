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

interface WelcomeEmailProps {
    userName?: string;
    loginUrl?: string;
}

export const WelcomeEmail = ({
    userName = 'there',
    loginUrl = 'https://app.hyrelog.com/login'
}: WelcomeEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Welcome to HyreLog - Your audit logging platform</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Welcome to HyreLog!</Heading>
                    <Text style={text}>Hi {userName},</Text>
                    <Text style={text}>
                        We&apos;re excited to have you on board. HyreLog helps
                        you maintain immutable audit logs with hash-chain
                        verification, ensuring compliance and security for your
                        applications.
                    </Text>
                    <Section style={buttonContainer}>
                        <Link style={button} href={loginUrl}>
                            Get Started
                        </Link>
                    </Section>
                    <Text style={text}>
                        If you have any questions, feel free to reach out to our
                        support team.
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

export default WelcomeEmail;

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
