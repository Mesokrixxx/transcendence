import { PrismaClientKnownRequestError, PrismaClientInitializationError } from "@prisma/client/runtime/client";
import { isPrismaError } from "./query.js";

export function prismaTreatError(err: unknown) {
    if (!isPrismaError(err))
        return { status: 500, error: 'internal server error' };
    
    if (err instanceof PrismaClientKnownRequestError) {
        switch (err.code) {
        case 'P2002':
            return { status: 409, error: 'value(s) already exists' };
        
        case 'P2025':
            return { status: 404, error: 'data not found' };
        
        default:
            return { status: 500, error: 'database error' };
        }
    }

    if (err instanceof PrismaClientInitializationError)
        return { status: 503, error: 'database unavailable' };

    return { status: 500, error: 'database error' };
}
    
