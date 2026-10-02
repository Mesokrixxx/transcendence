import type { PrismaError, QueryResponse } from '../types/db.types.js'

const isPrismaError = (err: unknown): err is PrismaError => {
  return err !== null && err !== undefined && (err as PrismaError).clientVersion !== undefined;
}

async function query<Type>(cb: () => Promise<Type>): Promise<QueryResponse<Type>> {
  try {
    const result = await cb();
    return result;
  } catch (e: unknown) {
    if (isPrismaError(e))
      return e;
    return Error("DB Error");
  }
}

export { isPrismaError, query };
