import * as z from 'zod';

export const ModelRouteScalarFieldEnumSchema = z.enum(['id', 'modelId', 'provider', 'providerModelId', 'inputPricePerM', 'outputPricePerM', 'currency', 'contextWindow', 'maxOutputTokens', 'platformEnabled', 'byokEnabled', 'status', 'createdAt', 'updatedAt'])

export type ModelRouteScalarFieldEnum = z.infer<typeof ModelRouteScalarFieldEnumSchema>;