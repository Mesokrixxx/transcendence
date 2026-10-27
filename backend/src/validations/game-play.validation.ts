import { z } from 'zod';
import type { Square } from '../../../chessgame/src/chessgame.types.js';

const square = z.custom<Square>(
	(value) => typeof value === 'string' && /^[a-h][1-8]$/.test(value),
	{ message: 'invalid chess square' },
);
const promotion = z.enum(['queen', 'rook', 'bishop', 'knight']);

export const moveSchema = z.object({
	from: square,
	to: square,
	promotion: promotion.optional(),
});
