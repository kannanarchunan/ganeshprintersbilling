import { z } from 'zod';

export const billSchema = z.object({
  place_id: z.string().uuid('Invalid place identifier'),
  bill_number: z.string().min(1, 'Bill number required').max(50).trim(),
  amount: z.number().positive('Amount must be greater than 0').max(9999999.99),
  notes: z.string().max(500).optional().nullable(),
  due_date: z.string().optional().nullable(), // Allow standard date strings, we will handle formatting
});
