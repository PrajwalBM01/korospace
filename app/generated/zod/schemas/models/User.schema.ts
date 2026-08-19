import * as z from 'zod';
import { PlanTierSchema } from '../enums/PlanTier.schema';

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  planTier: PlanTierSchema.default("FREE"),
  role: z.string().nullish(),
  banned: z.boolean().nullish(),
  banReason: z.string().nullish(),
  banExpires: z.date().nullish(),
});

export type UserType = z.infer<typeof UserSchema>;
