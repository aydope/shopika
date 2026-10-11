import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { homeFor, TEST_ACCOUNTS, useAuth } from '@/auth'
import { hasErrors, hasMinLength, isEmail, type FormErrors } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { usePage } from './Utils'

export function Login() {
  usePage('Sign in', 'Sign in to your ShopiKa account.')
  const login = useAuth((s) => s.login)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const signIn = (credentials = { email, password }) => {
    const result = login(credentials.email, credentials.password)
    if ('error' in result) setError(result.error)
    else navigate(homeFor(result.user))
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="display mb-6 text-3xl sm:text-4xl">
        SIGN <span className="grad">IN</span>
      </h1>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          signIn()
        }}
        className="space-y-4"
      >
        <Field label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} />
        <Field label="Password" type="password" autoComplete="current-password" value={password} onChange={setPassword} error={error} />
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
      <p className="mt-4 text-sm text-white/60">
        New here?{' '}
        <Link to="/register" className="text-ac underline">
          Create an account
        </Link>
      </p>
      <div className="mt-8 border border-white/20 p-4 text-sm">
        <p className="display mb-2 text-xs text-ac">TEST ACCOUNTS</p>
        {TEST_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            type="button"
            onClick={() => {
              setEmail(account.email)
              setPassword(account.password)
              signIn(account)
            }}
            className="block w-full py-2 text-left hover:text-ac"
          >
            {account.role === 'admin' ? 'Admin dashboard' : 'Member dashboard'}: {account.email} / {account.password}
          </button>
        ))}
      </div>
    </div>
  )
}

type RegisterField = 'name' | 'email' | 'password'
const MIN_PASSWORD_LENGTH = 8

export function Register() {
  usePage('Create account', 'Join ShopiKa for rewards and early access.')
  const register = useAuth((s) => s.register)
  const navigate = useNavigate()
  const [form, setForm] = useState<Record<RegisterField, string>>({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<FormErrors<RegisterField>>({})
  const update = (field: RegisterField) => (value: string) => setForm({ ...form, [field]: value })

  const submit = () => {
    const found: FormErrors<RegisterField> = {}
    if (!hasMinLength(form.name, 2)) found.name = 'Please enter your name'
    if (!isEmail(form.email)) found.email = 'Please enter a valid email'
    if (form.password.length < MIN_PASSWORD_LENGTH) found.password = `Use at least ${MIN_PASSWORD_LENGTH} characters`
    if (!hasErrors(found)) {
      const result = register(form.name.trim(), form.email, form.password)
      if ('error' in result) found.email = result.error
      else return navigate(homeFor(result.user))
    }
    setErrors(found)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="display mb-2 text-3xl sm:text-4xl">
        JOIN THE <span className="grad">CREW</span>
      </h1>
      <p className="mb-6 text-white/60">Earn points on every order and get early access to drops.</p>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="space-y-4"
      >
        <Field label="Full name" autoComplete="name" value={form.name} onChange={update('name')} error={errors.name} />
        <Field label="Email" type="email" autoComplete="email" value={form.email} onChange={update('email')} error={errors.email} />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
        />
        <p className="text-xs text-white/50">
          By creating an account you accept our{' '}
          <Link to="/terms" className="text-ac underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-ac underline">
            Privacy Policy
          </Link>
          .
        </p>
        <Button type="submit" className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-4 text-sm text-white/60">
        Already a member?{' '}
        <Link to="/login" className="text-ac underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
