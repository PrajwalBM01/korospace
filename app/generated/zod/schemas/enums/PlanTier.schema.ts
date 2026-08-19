import * as z from 'zod';

export const PlanTierSchema = z.enum(['FREE', 'PAID'])

export type PlanTier = z.infer<typeof PlanTierSchema>;