/**
 * Prisma 7 Configuration
 * 
 * Prisma 7 requires database connection URLs to be defined here
 * instead of in the schema.prisma file.
 */

import 'dotenv/config';

// Prisma 7 config format
export default {
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
