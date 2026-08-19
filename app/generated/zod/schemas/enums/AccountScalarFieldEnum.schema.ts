import * as z from 'zod';

export const AccountScalarFieldEnumSchema = z.enum(['id', 'accountId', 'providerId', 'userId', 'accessToken', 'refreshToken', 'idToken', 'accessTokenExpiresAt', 'refreshTokenExpiresAt', 'scope', 'password', 'createdAt', 'updatedAt', 'issuer'])

export type AccountScalarFieldEnum = z.infer<typeof AccountScalarFieldEnumSchema>;