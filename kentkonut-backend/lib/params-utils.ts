// Next.js 15 params compatibility utility
export async function getParams<T>(params: T | Promise<T>): Promise<T> {
  if (params instanceof Promise) {
    return await params;
  }
  return params;
}
