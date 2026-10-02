import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError, PrismaClientRustPanicError, PrismaClientInitializationError, PrismaClientValidationError } from "@prisma/client/runtime/client";

type PrismaError = PrismaClientKnownRequestError | PrismaClientUnknownRequestError | PrismaClientRustPanicError | PrismaClientInitializationError | PrismaClientValidationError;

type QueryResponse<Type> = { result: Type, error: null } | { result: null, error: PrismaError | Error };

export type { PrismaError, QueryResponse }
