import * as z from 'zod';
import { ModelProviderSchema } from '../enums/ModelProvider.schema';
import { ModelStatusSchema } from '../enums/ModelStatus.schema';
import { Prisma } from '../../../prisma/client';

export const ModelRouteSchema = z.object({
  id: z.string(),
  modelId: z.string(),
  provider: ModelProviderSchema,
  providerModelId: z.string(),
  inputPricePerM: z.instanceof(Prisma.Decimal, {
  message: "Field 'inputPricePerM' must be a Decimal. Location: ['Models', 'ModelRoute']",
}).nullish(),
  outputPricePerM: z.instanceof(Prisma.Decimal, {
  message: "Field 'outputPricePerM' must be a Decimal. Location: ['Models', 'ModelRoute']",
}).nullish(),
  currency: z.string().default("USD"),
  contextWindow: z.number().int().nullish(),
  maxOutputTokens: z.number().int().nullish(),
  platformEnabled: z.boolean(),
  byokEnabled: z.boolean().default(true),
  status: ModelStatusSchema.default("ACTIVE"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ModelRouteType = z.infer<typeof ModelRouteSchema>;
