import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hasString, isRecord } from '@/lib/guards'

/*
 * Client-side mock authentication for a storefront template: there is no server.
 * Accounts and passwords live in localStorage in plain text, so this must be replaced
 * with a real identity provider before handling real customers.
 */
export type Role = 'admin' | 'member'
export type User = { name: string; email: string; role: Role }
type Account = User & { password: string }
export type AuthResult = { user: User } | { error: string }

export const TEST_ACCOUNTS: Account[] = [
  { name: 'Admin', email: 'admin@shopika.com', password: 'admin123', role: 'admin' },
  { name: 'Mika Laine', email: 'member@shopika.com', password: 'member123', role: 'member' },
]

type AuthState = {
  user: User | null
  accounts: Account[]
  login: (email: string, password: string) => AuthResult
  register: (name: string, email: string, password: string) => AuthResult
  logout: () => void
}

const isRole = (value: unknown): value is Role => value === 'admin' || value === 'member'
const isUser = (value: unknown): value is User => isRecord(value) && hasString(value, 'name') && hasString(value, 'email') && isRole(value.role)
const isAccount = (value: unknown): value is Account => isUser(value) && isRecord(value) && hasString(value, 'password')

const toUser = ({ name, email, role }: Account): User => ({ name, email, role })

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accounts: [],
      login: (email, password) => {
        const normalized = email.trim().toLowerCase()
        const account = [...TEST_ACCOUNTS, ...get().accounts].find((a) => a.email === normalized && a.password === password)
        if (!account) return { error: 'Email or password is incorrect' }
        const user = toUser(account)
        set({ user })
        return { user }
      },
      register: (name, email, password) => {
        const normalized = email.trim().toLowerCase()
        if ([...TEST_ACCOUNTS, ...get().accounts].some((a) => a.email === normalized)) return { error: 'An account with this email already exists' }
        const account: Account = { name, email: normalized, password, role: 'member' }
        set((s) => ({ accounts: [...s.accounts, account], user: toUser(account) }))
        return { user: toUser(account) }
      },
      logout: () => set({ user: null }),
    }),
    {
      name: 'shopika-auth',
      merge: (stored, current) => {
        if (!isRecord(stored)) return current
        return { ...current, user: isUser(stored.user) ? stored.user : null, accounts: Array.isArray(stored.accounts) ? stored.accounts.filter(isAccount) : [] }
      },
    },
  ),
)

export const homeFor = (user: User) => (user.role === 'admin' ? '/admin' : '/account')
