import { z } from 'zod';

const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowercase = 'abcdefghijklmnopqrstuvwxyz';
const numbers = '0123456789';
const lettersAndNumbers = uppercase + lowercase + numbers;

const passwordSchema = z.string()
    .min(8)
    .max(100)
    .refine(
        password => [...password].some(char => uppercase.includes(char)),
        'At least one uppercase letter is required'
    )
    .refine(
        password => [...password].some(char => lowercase.includes(char)),
        'At least one lowercase letter is required'
    )
    .refine(
        password => [...password].some(char => numbers.includes(char)),
        'At least one number is required'
    )
    .refine(
        password => [...password].some(char =>
            !lettersAndNumbers.includes(char) && char.trim() !== ''
        ),
        'At least one special character is required'
    );

export const createUserSchema = z.object({
    username: z.string().trim().min(1).max(32),
    email: z.email(),
    password: passwordSchema,
});

export const authUserSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(100),
});

export const updateUserSchema = z.object({
    username: z.string().trim().min(1).max(32).optional(),
    password: passwordSchema.optional(),
    currentPassword: z.string().min(1).optional(),
}).refine(
    data => data.username !== undefined || data.password !== undefined,
    { message: 'at least one field must be updated' }
).refine(
    data => data.password === undefined || data.currentPassword !== undefined,
    {
        message: 'currentPassword is required to change password',
        path: ['currentPassword'],
    }
);