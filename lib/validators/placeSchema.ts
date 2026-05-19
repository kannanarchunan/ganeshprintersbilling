import { z } from 'zod';

export const placeSchema = z.object({
  name: z.string().min(2, 'Place name must be at least 2 characters').max(100).trim(),
});
