import type { PrismaError, QueryResponse } from '../types/db.types.js'

const isPrismaError = (err: unknown): err is PrismaError => {
  return err !== null && err !== undefined && (err as PrismaError).clientVersion !== undefined;
}

async function query<Type>(cb: () => Promise<Type>): Promise<QueryResponse<Type>> {
  try {
    const result = await cb();
    return { result: result, error: null } ;
  } catch (e: unknown) {
    return { result: null, error: isPrismaError(e) ? e : new Error('DB Error') };
  }
}

export { isPrismaError, query };
