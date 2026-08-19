import * as z from 'zod';

export const ModelSchema = z.object({
  id: z.string(),
  slug: z.string(),
  authorName: z.string(),
  family: z.string().nullish(),
  description: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ModelType = z.infer<typeof ModelSchema>;
