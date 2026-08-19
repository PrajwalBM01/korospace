import * as z from 'zod';

export const CredentialSourceSchema = z.enum(['PLATFORM', 'BYOK'])

export type CredentialSource = z.infer<typeof CredentialSourceSchema>;