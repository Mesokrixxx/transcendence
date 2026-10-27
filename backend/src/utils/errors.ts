import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime/client';
import { BackendError } from '../types/backendError.types.js';

export function treatError(err: unknown) {
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = Array.isArray(err.meta?.target) ? err.meta.target : [];

        if (target.includes('username'))
          return { status: 409, error: 'username already exists' };

        if (target.includes('email'))
          return { status: 409, error: 'email already exists' };

        return { status: 409, error: 'value(s) already exists' };
      }

      case 'P2025':
        return { status: 404, error: 'data not found' };

      default:
        return { status: 500, error: 'database error' };
    }
  }

  if (err instanceof PrismaClientInitializationError)
    return { status: 503, error: 'database unavailable' };

  if (err instanceof BackendError)
    return { status: err.status, error: err.message };

  return { status: 500, error: 'internal server error' };
}
