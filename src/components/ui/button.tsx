import type { ComponentProps } from 'react'
import { Link } from 'react-router-dom'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonStyles = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-none font-bold uppercase tracking-wide transition active:scale-95 disabled:opacity-40',
  {
    variants: {
      variant: {
        solid: 'bg-ac text-black hover:brightness-110',
        outline: 'border-2 border-ac text-ac hover:bg-ac hover:text-black',
        ghost: 'hover:bg-white/10',
      },
      size: {
        sm: 'h-10 px-3 text-xs',
        md: 'h-12 px-6 text-sm',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'solid', size: 'md' },
  },
)

type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonStyles>

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonStyles({ variant, size }), className)} {...props} />
}

/** A router link that looks like a Button. Use it instead of wrapping a Button in a Link, which nests two controls. */
type ButtonLinkProps = ComponentProps<typeof Link> & VariantProps<typeof buttonStyles>

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonStyles({ variant, size }), className)} {...props} />
}
