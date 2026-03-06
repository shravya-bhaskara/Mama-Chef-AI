import { z } from 'zod';
import { insertRecipeSchema, recipes } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  recipes: {
    list: {
      method: 'GET' as const,
      path: '/api/recipes' as const,
      responses: {
        200: z.array(z.custom<typeof recipes.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/recipes/:id' as const,
      responses: {
        200: z.custom<typeof recipes.$inferSelect>(),
        404: errorSchemas.internal,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/recipes' as const,
      input: z.object({
        ingredients: z.array(z.string()),
        preferences: z.object({
          cuisine: z.string().optional(),
          familySize: z.string().optional(),
          culture: z.string().optional(),
          dietaryRestrictions: z.string().optional(),
        }),
      }),
      responses: {
        201: z.custom<typeof recipes.$inferSelect>(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type CreateRecipeRequest = z.infer<typeof api.recipes.create.input>;
export type RecipeResponse = z.infer<typeof api.recipes.create.responses[201]>;
export type RecipesListResponse = z.infer<typeof api.recipes.list.responses[200]>;
