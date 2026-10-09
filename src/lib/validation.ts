const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

export type FormErrors<Key extends string> = Partial<Record<Key, string>>

export const isEmail = (value: string) => EMAIL_PATTERN.test(value.trim())
export const hasMinLength = (value: string, min: number) => value.trim().length >= min
export const hasErrors = (errors: object) => Object.keys(errors).length > 0
