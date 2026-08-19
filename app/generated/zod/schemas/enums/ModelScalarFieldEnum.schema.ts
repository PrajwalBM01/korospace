import * as z from 'zod';

export const ModelScalarFieldEnumSchema = z.enum(['id', 'slug', 'authorName', 'family', 'description', 'createdAt', 'updatedAt'])

export type ModelScalarFieldEnum = z.infer<typeof ModelScalarFieldEnumSchema>;