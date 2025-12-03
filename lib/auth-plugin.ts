import type { BetterAuthOptions } from 'better-auth';
import { hashPassword, verifyPassword } from './password';

/**
 * Better-Auth plugin to use Argon2 for password hashing
 * This plugin intercepts password hashing/verification and uses Argon2 instead of bcrypt
 */
export function argon2PasswordPlugin(): NonNullable<BetterAuthOptions['plugins']>[number] {
  return {
    id: 'argon2-password',
    // Note: Better-Auth may not expose password hashing hooks directly
    // This is a placeholder structure - actual implementation depends on Better-Auth's API
    // You may need to create a custom adapter or wait for Better-Auth to support custom password hashing
    
    // If Better-Auth supports hooks, they would look something like this:
    // hooks: {
    //   before: {
    //     'user.create': async (ctx) => {
    //       if (ctx.data.password) {
    //         ctx.data.password = await hashPassword(ctx.data.password);
    //       }
    //       return ctx;
    //     },
    //   },
    // },
  };
}

