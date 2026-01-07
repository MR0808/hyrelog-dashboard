/**
 * Prisma Client for Dashboard Database
 *
 * Prisma 7: Uses connection string from prisma.config.ts
 *
 * Note: better-auth's prismaAdapter may have compatibility issues with Prisma 7.
 * We're using the adapter for database operations, but better-auth might need
 * access to the client in a specific way.
 */

import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
    const basePrisma = new PrismaClient({
        adapter,
        log:
            process.env.NODE_ENV === 'development'
                ? ['query', 'error', 'warn']
                : ['error']
    });

    // Prisma 7: Use client extensions to fix better-auth field mapping issues
    // better-auth tries to use accountId/providerId but our schema uses id/provider
    return basePrisma.$extends({
        query: {
            account: {
                async create({ args, query }) {
                    // Fix field mapping for create operations
                    if (args.data) {
                        const data = args.data as any;
                        // Remove accountId if present (we use id)
                        if ('accountId' in data) {
                            delete data.accountId;
                        }
                        // Map providerId to provider
                        if ('providerId' in data) {
                            data.provider = data.providerId;
                            delete data.providerId;
                        }
                        // Remove createdAt/updatedAt - Prisma auto-generates these
                        if ('createdAt' in data) {
                            delete data.createdAt;
                        }
                        if ('updatedAt' in data) {
                            delete data.updatedAt;
                        }
                        // Ensure providerAccountId is set (use userId as fallback)
                        if (!data.providerAccountId && data.userId) {
                            data.providerAccountId = data.userId;
                        }
                        // Ensure type is set
                        if (!data.type) {
                            data.type = 'credential';
                        }
                        // Ensure provider is set
                        if (!data.provider) {
                            data.provider = 'credential';
                        }
                    }
                    return query(args);
                },
                async update({ args, query }) {
                    // Fix field mapping for update operations
                    if (args.data) {
                        const data = args.data as any;
                        if ('providerId' in data) {
                            data.provider = data.providerId;
                            delete data.providerId;
                        }
                    }
                    return query(args);
                }
            }
        }
    });
}

// Prisma 7: Create adapter for direct database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Create Prisma client with adapter and extensions
// Prisma 7: Use $extends instead of $use (middleware was removed)
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
