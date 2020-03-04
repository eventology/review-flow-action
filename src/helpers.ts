export const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

export function flattenToArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) return []
  if (Array.isArray(value)) return value
  return [value]
}
