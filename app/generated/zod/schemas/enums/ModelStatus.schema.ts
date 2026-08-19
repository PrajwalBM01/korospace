import * as z from 'zod';

export const ModelStatusSchema = z.enum(['ACTIVE', 'DEPRECATED', 'RETIRED'])

export type ModelStatus = z.infer<typeof ModelStatusSchema>;