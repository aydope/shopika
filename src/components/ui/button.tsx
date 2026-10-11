import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
const v = cva(
  'inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wide transition active:scale-95 disabled:opacity-40 cursor-pointer',
  {
    variants: {
      variant: {
        solid: 'bg-ac text-black hover:brightness-110',
        outline: 'border-2 border-ac text-ac hover:bg-ac hover:text-black',
        ghost: 'hover:bg-white/10',
      },
      size: { sm: 'h-10 px-3 text-xs', md: 'h-12 px-6 text-sm', icon: 'h-11 w-11' },
    },
    defaultVariants: { variant: 'solid', size: 'md' },
  },
)
export function Button({
  className,
  variant,
  size,
  type = 'button',
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof v>) {
  return <button type={type} className={cn(v({ variant, size }), 'rounded-none', className)} {...p} />
}
