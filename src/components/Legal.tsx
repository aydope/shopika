import { useState } from 'react'
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react'
import { Step, StepLabel, Stepper } from '@mui/material'
import { usePage } from './Utils'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
type Doc = { title: string; intro: string; s: [string, string][] }
const docs: Record<string, Doc> = {
  privacy: { title: 'Privacy Policy', intro: 'Last updated October 2026. This policy explains what personal data ShopiKa collects and why.', s: [['Data we collect', 'Account details (name, email), order and delivery information, and basic usage data such as pages visited and device type.'], ['How we use it', 'To process orders, provide support, prevent fraud, and send updates you opted into. We never sell personal data.'], ['Cookies', 'Essential cookies keep your cart and preferences. Analytics cookies are only used with your consent.'], ['Your rights', 'You can access, correct, export or delete your data at any time by contacting privacy@shopika.com.'], ['Retention', 'Order records are kept for 7 years for tax purposes. Marketing data is deleted when you unsubscribe.'], ['Contact', 'Questions about this policy can be sent to privacy@shopika.com.']] },
  terms: { title: 'Terms of Service', intro: 'By using ShopiKa you agree to the terms below.', s: [['Orders and pricing', 'Prices are shown in USD and include applicable taxes unless stated. We may cancel orders affected by pricing errors and will refund you in full.'], ['Accounts', 'You are responsible for keeping your login details safe and for activity under your account.'], ['Limited drops', 'Limited items are sold while stock lasts and are not restocked. Quantity limits may apply.'], ['Intellectual property', 'All graphics, logos and designs are owned by ShopiKa and may not be copied without permission.'], ['Liability', 'To the extent permitted by law, ShopiKa is not liable for indirect damages arising from use of the store.'], ['Changes', 'We may update these terms. Continued use of the store means you accept the updated terms.']] },
  shipping: { title: 'Shipping and Returns', intro: 'Fast shipping and easy returns on every order.', s: [['Delivery times', 'Orders ship within 24 hours. Standard delivery takes 3 to 7 business days, express 1 to 3.'], ['Shipping costs', 'Free standard shipping on orders over $150. Otherwise $9.90.'], ['Returns', 'Return unworn items with tags within 30 days for a full refund. Start a return from your account or contact support.'], ['Exchanges', 'Need another size? Place a new order and return the original for a refund.'], ['Damaged items', 'If something arrives damaged, send us a photo within 7 days and we will replace it at no cost.']] },
}
export function Legal({ doc }: { doc: keyof typeof docs }) {
  const d = docs[doc]; usePage(d.title, d.intro)
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="display mb-3 text-3xl sm:text-5xl">{d.title}</h1><p className="mb-10 text-white/60">{d.intro}</p>
      {d.s.map(([h, t], i) => <section key={h} className="mb-8"><h2 className="display mb-2 text-lg text-ac">{i + 1}. {h}</h2><p className="leading-relaxed text-white/80">{t}</p></section>)}
    </article>
  )
}
export function Contact() {
  usePage('Contact', 'Contact the ShopiKa support team.')
  const [f, setF] = useState({ name: '', email: '', msg: '' }), [e, setE] = useState<Record<string, string>>({}), [ok, setOk] = useState(false)
  const send = () => { const x: Record<string, string> = {}; if (f.name.trim().length < 2) x.name = 'Please enter your name'; if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = 'Please enter a valid email'; if (f.msg.trim().length < 10) x.msg = 'Message must be at least 10 characters'; setE(x); if (!Object.keys(x).length) setOk(true) }
  const cls = (k: string) => `mt-1 w-full border-2 bg-black p-3 text-white outline-none focus:border-ac ${e[k] ? 'border-ac2' : 'border-white/20'}`
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2">
      <div><h1 className="display mb-4 text-3xl sm:text-5xl">TALK TO <span className="grad">US</span></h1><p className="mb-8 text-white/60">We reply within one business day.</p>
        {[[Mail, 'support@shopika.com'], [Phone, '+358 40 123 4567'], [MapPin, 'Mannerheimintie 1, Helsinki']].map(([I, t]: any) => <p key={t} className="mb-4 flex items-center gap-3"><I className="text-ac" />{t}</p>)}</div>
      {ok ? <div className="grid place-items-center border-2 border-ac p-10 text-center"><div><CheckCircle2 className="mx-auto mb-3 text-ac" size={48} /><h2 className="display text-xl">Message sent</h2><p className="mt-2 text-white/60">Thanks {f.name}, we will reply to {f.email}.</p></div></div> :
        <form noValidate onSubmit={(ev) => { ev.preventDefault(); send() }} className="space-y-4">
          {[['name', 'Name', 'name'], ['email', 'Email', 'email']].map(([k, l, ac]) => <label key={k} className="block text-sm">{l}<input autoComplete={ac} value={(f as any)[k]} onChange={(x) => setF({ ...f, [k]: x.target.value })} aria-invalid={!!e[k]} className={cls(k) + ' h-12'} />{e[k] && <span role="alert" className="text-sm text-ac2">{e[k]}</span>}</label>)}
          <label className="block text-sm">Message<textarea rows={5} value={f.msg} onChange={(x) => setF({ ...f, msg: x.target.value })} aria-invalid={!!e.msg} className={cls('msg')} />{e.msg && <span role="alert" className="text-sm text-ac2">{e.msg}</span>}</label>
          <Button type="submit" className="w-full">Send message</Button></form>}
    </div>
  )
}
export function Track() {
  usePage('Track order', 'Track your ShopiKa order.')
  const orders = useStore((s) => s.orders), [q, setQ] = useState(''), [res, setRes] = useState<number | null | undefined>(undefined)
  const go = () => { const id = q.trim().toUpperCase(), o = orders.find((x) => x.id === id); setRes(o ? 1 : /^SK-\d{6}$/.test(id) ? Number(id.slice(-1)) % 4 : null) }
  return (
    <div className="mx-auto max-w-2xl px-4 py-12"><h1 className="display mb-6 text-3xl sm:text-5xl">TRACK <span className="grad">ORDER</span></h1>
      <form onSubmit={(e) => { e.preventDefault(); go() }} className="flex gap-2"><input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Order number" placeholder="SK-123456" className="h-12 flex-1 border-2 border-white/20 bg-black px-3 outline-none focus:border-ac" /><Button type="submit">Track</Button></form>
      {res === null && <p role="alert" className="mt-4 text-ac2">We could not find that order. Check the number and try again.</p>}
      {typeof res === 'number' && <div className="mt-8"><Stepper activeStep={res} alternativeLabel sx={{ '& .Mui-active,& .Mui-completed': { color: 'var(--ac) !important' }, '& .MuiStepLabel-label': { color: '#fff' } }}>{['Processing', 'Packed', 'Shipped', 'Delivered'].map((s) => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}</Stepper></div>}
    </div>
  )
}
