import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

type FieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  type?: 'text' | 'email' | 'password'
  autoComplete?: string
  multiline?: boolean
  rows?: number
}

/** Labelled text control with an accessible error message. Passwords get a show/hide toggle. */
export function Field({
  label,
  value,
  onChange,
  error,
  type = 'text',
  autoComplete,
  multiline = false,
  rows = 4,
}: FieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const [revealed, setRevealed] = useState(false)
  const isPassword = type === 'password'
  const controlClass = cn(
    'mt-1 w-full border-2 bg-black px-3 text-white outline-none focus:border-ac',
    error ? 'border-ac2' : 'border-white/20',
  )
  const describedBy = error ? errorId : undefined

  return (
    <div className="text-sm text-white/80">
      <label htmlFor={id}>{label}</label>
      <div className="relative">
        {multiline ? (
          
            <textarea
              id={id}
              rows={rows}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              autoComplete={autoComplete}
              aria-invalid={Boolean(error)}
              aria-describedby={describedBy}
              className={cn(controlClass, 'p-3')}
            />
          
        ) : (
          
            <input
              id={id}
              type={isPassword && revealed ? 'text' : type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              autoComplete={autoComplete}
              aria-invalid={Boolean(error)}
              aria-describedby={describedBy}
              className={cn(controlClass, 'h-12', isPassword && 'pr-12')}
            />
          
        )}
        {isPassword && (
          <button
            type="button"
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            onClick={() => setRevealed((r) => !r)}
            className="absolute right-0 top-1 grid h-12 w-12 place-items-center text-white/60"
          >
            {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p id={errorId} role="alert" className="text-ac2">{error}</p>}
    </div>
  )
}
