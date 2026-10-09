import { create } from 'zustand'
import { persist } from 'zustand/middleware'
export type User = { name: string; email: string; role: 'admin' | 'member' }
type A = { user: User | null; users: (User & { pw: string })[]; login: (e: string, p: string) => string | null; register: (n: string, e: string, p: string) => string | null; logout: () => void }
export const TEST = [{ name: 'Admin', email: 'admin@shopika.com', pw: 'admin123', role: 'admin' as const }, { name: 'Mika Laine', email: 'member@shopika.com', pw: 'member123', role: 'member' as const }]
export const useAuth = create<A>()(persist((set, get) => ({
  user: null, users: [],
  login: (e, p) => { const u = [...TEST, ...get().users].find((x) => x.email === e.toLowerCase() && x.pw === p); if (!u) return 'Email or password is incorrect'; set({ user: { name: u.name, email: u.email, role: u.role } }); return null },
  register: (name, e, pw) => { e = e.toLowerCase(); if ([...TEST, ...get().users].some((x) => x.email === e)) return 'An account with this email already exists'; const u = { name, email: e, pw, role: 'member' as const }; set((s) => ({ users: [...s.users, u], user: { name, email: e, role: 'member' } })); return null },
  logout: () => set({ user: null }),
}), { name: 'shopika-auth' }))
