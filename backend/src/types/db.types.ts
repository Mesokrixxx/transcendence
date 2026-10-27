import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError, PrismaClientRustPanicError, PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/client";

type PrismaError = PrismaClientKnownRequestError | PrismaClientUnknownRequestError | PrismaClientRustPanicError | PrismaClientInitializationError | PrismaClientValidationError;

type QueryResponse<Type> = { result: Type, error: null } | { result: null, error: unknown };

export type { PrismaError, QueryResponse }
