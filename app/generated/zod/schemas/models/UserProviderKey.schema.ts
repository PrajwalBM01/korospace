import * as z from 'zod';
import { ModelProviderSchema } from '../enums/ModelProvider.schema';

export const UserProviderKeySchema = z.object({
  id: z.string(),
  userId: z.string(),
  provider: ModelProviderSchema,
  ciphertext: z.string(),
  iv: z.string(),
  authTag: z.string(),
  fingerprint: z.string(),
  isValid: z.boolean().default(true),
});

export type UserProviderKeyType = z.infer<typeof UserProviderKeySchema>;
