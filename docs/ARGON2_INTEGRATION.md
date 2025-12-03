# Argon2 Password Hashing Integration

## Current Status

✅ **Argon2 is now fully integrated!** Better-Auth supports custom password hashing through the `emailAndPassword.password` configuration.

## Implementation

### 1. Argon2 Utilities

We've created `lib/password.ts` with Argon2 hashing utilities:

- `hashPassword(password: string)`: Hashes a password using Argon2id
- `verifyPassword({ hash, password })`: Verifies a password against an Argon2 hash (matches Better-Auth's expected signature)
- `isArgon2Hash(hash: string)`: Checks if a hash is using Argon2 format

### 2. Better-Auth Configuration

Argon2 is configured in `lib/auth.ts` through the `emailAndPassword.password` option:

```typescript
emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    password: {
        hash: hashPassword,
        verify: verifyPassword
    }
}
```

This tells Better-Auth to use our Argon2 functions for all password hashing and verification operations.

### 4. Migration Strategy

If implementing Argon2:

1. **New Users**: All new passwords will use Argon2
2. **Existing Users**: Implement a migration strategy:
    - On login, check if password uses bcrypt or Argon2
    - If bcrypt, verify with bcrypt, then rehash with Argon2
    - Update the database with the Argon2 hash

### 5. Configuration

Argon2 is configured with these parameters (in `lib/password.ts`):

- **Type**: Argon2id (resistant to both side-channel and time-memory trade-off attacks)
- **Memory Cost**: 65536 KB (64 MB)
- **Time Cost**: 3 iterations
- **Parallelism**: 4 threads

These parameters provide a good balance between security and performance.

## Next Steps

1. **Research Better-Auth's adapter structure** to understand how to create a custom adapter
2. **Implement custom adapter** if Better-Auth doesn't support hooks
3. **Test password hashing** with both bcrypt (existing) and Argon2 (new)
4. **Implement migration strategy** for existing users
5. **Update documentation** once Argon2 is fully integrated

## References

- [Argon2 Specification](https://github.com/P-H-C/phc-winner-argon2)
- [Better-Auth Documentation](https://www.better-auth.com/docs)
- [Node.js argon2 Package](https://www.npmjs.com/package/argon2)
