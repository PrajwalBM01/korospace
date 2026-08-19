import * as z from 'zod';

export const UserProviderKeyScalarFieldEnumSchema = z.enum(['id', 'userId', 'provider', 'ciphertext', 'iv', 'authTag', 'fingerprint', 'isValid'])

export type UserProviderKeyScalarFieldEnum = z.infer<typeof UserProviderKeyScalarFieldEnumSchema>;