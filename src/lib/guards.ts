/** Runtime checks for data read from outside the type system (localStorage, network). */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')
export const hasString = (value: Record<string, unknown>, key: string) => typeof value[key] === 'string'
export const hasNumber = (value: Record<string, unknown>, key: string) => typeof value[key] === 'number'
