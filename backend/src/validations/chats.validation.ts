import { z } from 'zod';

export const appendToSchema = 
    z.object({
        message: z.string().trim().min(1).max(2048)
    });

export const privateChatSchema = z.object({
    userId: z.number().int().positive(),
});
