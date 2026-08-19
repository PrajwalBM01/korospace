import * as z from 'zod';

export const ModelProviderSchema = z.enum(['OPENROUTER', 'ANTHROPIC', 'GOOGLE', 'OPENAI'])

export type ModelProvider = z.infer<typeof ModelProviderSchema>;