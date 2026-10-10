import { useState } from 'react'
import { Mail, Phone, MapPin, CheckCircle2, type LucideIcon } from 'lucide-react'
import { Step, StepLabel, Stepper } from '@mui/material'
import { usePage } from './Utils'
import { useStore } from '@/store'
import { adminOrders, pastOrders } from '@/data/mock'
import { hasErrors, hasMinLength, isEmail, type FormErrors } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'

type Doc = {
  title: string
  intro: string
  sections: [heading: string, text: string][]
}

type DocId = 'privacy' | 'terms' | 'shipping'

const DOCS: Record<DocId, Doc> = {
  privacy: {
    title: 'Privacy Policy',
    intro: 'Last updated October 2026. This policy explains what personal data ShopiKa collects and why.',
    sections: [
      [
        'Data we collect',
        'Account details (name, email), order and delivery information, and basic usage data such as pages visited and device type.',
      ],
      [
        'How we use it',
        'To process orders, provide support, prevent fraud, and send updates you opted into. We never sell personal data.',
      ],
      [
        'Cookies',
        'Essential cookies keep your cart and preferences. Analytics cookies are only used with your consent.',
      ],
      [
        'Your rights',
        'You can access, correct, export or delete your data at any time by contacting privacy@shopika.com.',
      ],
      [
        'Retention',
        'Order records are kept for 7 years for tax purposes. Marketing data is deleted when you unsubscribe.',
      ],
      [
        'Contact',
        'Questions about this policy can be sent to privacy@shopika.com.',
      ],
    ],
  },
  terms: {
    title: 'Terms of Service',
    intro: 'By using ShopiKa you agree to the terms below.',
    sections: [
      [
        'Orders and pricing',
        'Prices are shown in USD and include applicable taxes unless stated. We may cancel orders affected by pricing errors and will refund you in full.',
      ],
      [
        'Accounts',
        'You are responsible for keeping your login details safe and for activity under your account.',
      ],
      [
        'Limited drops',
        'Limited items are sold while stock lasts and are not restocked. Quantity limits may apply.',
      ],
      [
        'Intellectual property',
        'All graphics, logos and designs are owned by ShopiKa and may not be copied without permission.',
      ],
      [
        'Liability',
        'To the extent permitted by law, ShopiKa is not liable for indirect damages arising from use of the store.',
      ],
      [
        'Changes',
        'We may update these terms. Continued use of the store means you accept the updated terms.',
      ],
    ],
  },
  shipping: {
    title: 'Shipping and Returns',
    intro: 'Fast shipping and easy returns on every order.',
    sections: [
      [
        'Delivery times',
        'Orders ship within 24 hours. Standard delivery takes 3 to 7 business days, express 1 to 3.',
      ],
      [
        'Shipping costs',
        'Free standard shipping on orders over $150. Otherwise $9.90.',
      ],
      [
        'Returns',
        'Return unworn items with tags within 30 days for a full refund. Start a return from your account or contact support.',
      ],
      [
        'Exchanges',
        'Need another size? Place a new order and return the original for a refund.',
      ],
      [
        'Damaged items',
        'If something arrives damaged, send us a photo within 7 days and we will replace it at no cost.',
      ],
    ],
  },
}
export function Legal({ doc }: { doc: DocId }) {
  const { title, intro, sections } = DOCS[doc]
  usePage(title, intro)
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="display mb-3 text-3xl sm:text-5xl">{title}</h1>
      <p className="mb-10 text-white/60">{intro}</p>
      {sections.map(([heading, text], index) => (
        <section key={heading} className="mb-8">
          <h2 className="display mb-2 text-lg text-ac">
            {index + 1}. {heading}
          </h2>
          <p className="leading-relaxed text-white/80">{text}</p>
        </section>
      ))}
    </article>
  )
}

type ContactField = 'name' | 'email' | 'message'
const CONTACT_DETAILS: { Icon: LucideIcon; text: string }[] = [
  { Icon: Mail, text: 'support@shopika.com' },
  { Icon: Phone, text: '+358 40 123 4567' },
  { Icon: MapPin, text: 'Mannerheimintie 1, Helsinki' },
]

/** The form has no backend: valid input only switches the UI to its confirmation state. */
export function Contact() {
  usePage('Contact', 'Contact the ShopiKa support team.')
  const [form, setForm] = useState<Record<ContactField, string>>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<FormErrors<ContactField>>({})
  const [sent, setSent] = useState(false)
  const update = (field: ContactField) => (value: string) => setForm({ ...form, [field]: value })

  const send = () => {
    const found: FormErrors<ContactField> = {}
    if (!hasMinLength(form.name, 2)) found.name = 'Please enter your name'
    if (!isEmail(form.email)) found.email = 'Please enter a valid email'
    if (!hasMinLength(form.message, 10)) found.message = 'Message must be at least 10 characters'
    setErrors(found)
    if (!hasErrors(found)) setSent(true)
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <h1 className="display mb-4 text-3xl sm:text-5xl">TALK TO <span className="grad">US</span></h1>
        <p className="mb-8 text-white/60">We reply within one business day.</p>
        {CONTACT_DETAILS.map(({ Icon, text }) => (
          <p key={text} className="mb-4 flex items-center gap-3"><Icon className="text-ac" />{text}</p>
        ))}
      </div>
      {sent ? (
        <div role="status" className="grid place-items-center border-2 border-ac p-10 text-center">
          <div>
            <CheckCircle2 className="mx-auto mb-3 text-ac" size={48} />
            <h2 className="display text-xl">Message sent</h2>
            <p className="mt-2 text-white/60">Thanks {form.name}, we will reply to {form.email}.</p>
          </div>
        </div>
      ) : (
        <form noValidate onSubmit={(e) => { e.preventDefault(); send() }} className="space-y-4">
          <Field label="Name" autoComplete="name" value={form.name} onChange={update('name')} error={errors.name} />
          <Field
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
          />
          <Field
            label="Message"
            multiline
            rows={5}
            value={form.message}
            onChange={update('message')}
            error={errors.message}
          />
          <Button type="submit" className="w-full">Send message</Button>
        </form>
      )}
    </div>
  )
}

const ORDER_STEPS = ['Processing', 'Packed', 'Shipped', 'Delivered']

/** Looks up orders placed in this browser plus the sample orders used by the dashboards. */
export function Track() {
  usePage('Track order', 'Track your ShopiKa order.')
  const orders = useStore((s) => s.orders)
  const [orderNumber, setOrderNumber] = useState('')
  const [result, setResult] = useState<{ found: false } | { found: true; step: number } | null>(null)

  const lookUp = () => {
    const id = orderNumber.trim().toUpperCase()
    const order = [...orders, ...pastOrders, ...adminOrders].find((o) => o.id === id)
    setResult(order ? { found: true, step: Math.max(0, ORDER_STEPS.indexOf(order.status)) } : { found: false })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="display mb-6 text-3xl sm:text-5xl">TRACK <span className="grad">ORDER</span></h1>
      <form onSubmit={(e) => { e.preventDefault(); lookUp() }} className="flex gap-2">
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          aria-label="Order number"
          placeholder="SK-123456"
          className="h-12 flex-1 border-2 border-white/20 bg-black px-3 outline-none focus:border-ac"
        />
        <Button type="submit">Track</Button>
      </form>
      {result && !result.found && (
        <p role="alert" className="mt-4 text-ac2">
          We could not find that order. Check the number and try again.
        </p>
      )}
      {result?.found && (
        <div className="mt-8">
          <Stepper
            activeStep={result.step}
            alternativeLabel
            sx={{ '& .Mui-active,& .Mui-completed': { color: 'var(--ac) !important' }, '& .MuiStepLabel-label': { color: '#fff' } }}
          >
            {ORDER_STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>
        </div>
      )}
    </div>
  )
}
