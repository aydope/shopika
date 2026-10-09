import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth, TEST } from '@/auth'
import { Button } from '@/components/ui/button'
import { usePage } from './Utils'
function Field({ label, type = 'text', value, onChange, error, ac }: { label: string; type?: string; value: string; onChange: (v: string) => void; error?: string; ac: string }) {
  const [show, setShow] = useState(false), pw = type === 'password'
  return (
    <label className="block text-sm">{label}
      <span className="relative mt-1 block"><input type={pw && show ? 'text' : type} value={value} autoComplete={ac} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} className={`h-12 w-full border-2 bg-black px-3 text-white outline-none focus:border-ac ${error ? 'border-ac2' : 'border-white/20'}`} />
        {pw && <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)} className="absolute right-0 top-0 grid h-12 w-12 place-items-center text-white/60">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>}</span>
      {error && <span role="alert" className="text-sm text-ac2">{error}</span>}
    </label>
  )
}
export function Login() {
  usePage('Sign in', 'Sign in to your ShopiKa account.')
  const { login } = useAuth(), nav = useNavigate(), [e, setE] = useState(''), [p, setP] = useState(''), [err, setErr] = useState('')
  const go = (em = e, pw = p) => { const m = login(em, pw); if (m) return setErr(m); nav(em.startsWith('admin') ? '/admin' : '/account') }
  return (
    <div className="mx-auto max-w-md px-4 py-12"><h1 className="display mb-6 text-3xl sm:text-4xl">SIGN <span className="grad">IN</span></h1>
      <form noValidate onSubmit={(x) => { x.preventDefault(); go() }} className="space-y-4"><Field label="Email" type="email" ac="email" value={e} onChange={setE} /><Field label="Password" type="password" ac="current-password" value={p} onChange={setP} error={err} /><Button type="submit" className="w-full">Sign in</Button></form>
      <p className="mt-4 text-sm text-white/60">New here? <Link to="/register" className="text-ac underline">Create an account</Link></p>
      <div className="mt-8 border border-white/20 p-4 text-sm"><p className="display mb-2 text-xs text-ac">TEST ACCOUNTS</p>{TEST.map((t) => <button key={t.email} type="button" onClick={() => { setE(t.email); setP(t.pw); go(t.email, t.pw) }} className="block w-full py-2 text-left hover:text-ac">{t.role === 'admin' ? 'Admin dashboard' : 'Member dashboard'}: {t.email} / {t.pw}</button>)}</div>
    </div>
  )
}
export function Register() {
  usePage('Create account', 'Join ShopiKa for rewards and early access.')
  const { register } = useAuth(), nav = useNavigate(), [f, setF] = useState({ name: '', email: '', pw: '' }), [er, setEr] = useState<Record<string, string>>({})
  const go = () => { const x: Record<string, string> = {}; if (f.name.trim().length < 2) x.name = 'Please enter your name'; if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = 'Please enter a valid email'; if (f.pw.length < 8) x.pw = 'Use at least 8 characters'; if (!Object.keys(x).length) { const m = register(f.name.trim(), f.email, f.pw); if (m) x.email = m; else return nav('/account') } setEr(x) }
  return (
    <div className="mx-auto max-w-md px-4 py-12"><h1 className="display mb-2 text-3xl sm:text-4xl">JOIN THE <span className="grad">CREW</span></h1><p className="mb-6 text-white/60">Earn points on every order and get early access to drops.</p>
      <form noValidate onSubmit={(x) => { x.preventDefault(); go() }} className="space-y-4"><Field label="Full name" ac="name" value={f.name} onChange={(v) => setF({ ...f, name: v })} error={er.name} /><Field label="Email" type="email" ac="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} error={er.email} /><Field label="Password" type="password" ac="new-password" value={f.pw} onChange={(v) => setF({ ...f, pw: v })} error={er.pw} />
        <p className="text-xs text-white/50">By creating an account you accept our <Link to="/terms" className="text-ac underline">Terms</Link> and <Link to="/privacy" className="text-ac underline">Privacy Policy</Link>.</p><Button type="submit" className="w-full">Create account</Button></form>
      <p className="mt-4 text-sm text-white/60">Already a member? <Link to="/login" className="text-ac underline">Sign in</Link></p></div>
  )
}
