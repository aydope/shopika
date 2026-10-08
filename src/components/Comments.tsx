import { useState } from 'react'
import { Rating } from '@mui/material'
import { ThumbsUp } from 'lucide-react'
import { useStore } from '@/store'
import { useAuth } from '@/auth'
import { Button } from '@/components/ui/button'
import type { Review } from '@/data/products'
export function Comments({ k, seed, rated }: { k: string; seed: Review[]; rated?: boolean }) {
  const { comments, addComment, voted, vote } = useStore(), user = useAuth((s) => s.user)
  const [name, setName] = useState(user?.name || ''), [text, setText] = useState(''), [rating, setRating] = useState<number | null>(null), [err, setErr] = useState<Record<string, string>>({}), [sent, setSent] = useState(false)
  const all = [...(comments[k] || []), ...seed]
  const submit = () => {
    const e: Record<string, string> = {}
    if (name.trim().length < 2) e.name = 'Please enter your name'; if (text.trim().length < 5) e.text = 'Write at least 5 characters'; if (rated && !rating) e.rating = 'Please choose a rating'
    setErr(e); if (Object.keys(e).length) return
    addComment(k, { id: 'c' + Date.now(), name: name.trim(), text: text.trim(), date: new Date().toISOString().slice(0, 10), rating: rated ? rating! : undefined, likes: 0 }); setText(''); setRating(null); setSent(true); setTimeout(() => setSent(false), 3000)
  }
  const cls = (x: string) => `mt-1 w-full border-2 bg-black p-3 text-white outline-none focus:border-ac ${err[x] ? 'border-ac2' : 'border-white/20'}`
  return (
    <section aria-label="Comments">
      <h3 className="display mb-4 text-lg">{rated ? 'Reviews' : 'Comments'} ({all.length})</h3>
      <form noValidate onSubmit={(e) => { e.preventDefault(); submit() }} className="mb-8 space-y-3 border-2 border-white/10 p-4">
        <label className="block text-sm">Name<input value={name} autoComplete="name" onChange={(e) => setName(e.target.value)} aria-invalid={!!err.name} className={cls('name') + ' h-11'} />{err.name && <span role="alert" className="text-ac2">{err.name}</span>}</label>
        {rated && <div><p className="text-sm">Your rating</p><Rating value={rating} onChange={(_, v) => setRating(v)} />{err.rating && <p role="alert" className="text-sm text-ac2">{err.rating}</p>}</div>}
        <label className="block text-sm">{rated ? 'Your review' : 'Your comment'}<textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} aria-invalid={!!err.text} className={cls('text')} />{err.text && <span role="alert" className="text-ac2">{err.text}</span>}</label>
        <div className="flex items-center gap-3"><Button type="submit" size="sm">Post {rated ? 'review' : 'comment'}</Button>{sent && <span role="status" className="text-sm text-ac">Thanks, your {rated ? 'review' : 'comment'} was posted</span>}</div>
      </form>
      <ul className="space-y-4">{all.map((c) => <li key={c.id} className="border border-white/10 p-4"><div className="mb-2 flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center bg-ac font-black text-black">{c.name[0]?.toUpperCase()}</span><div className="min-w-0 flex-1"><b className="block text-sm">{c.name}</b><span className="text-xs text-white/50">{c.date}</span></div>{c.rating && <Rating value={c.rating} readOnly size="small" />}</div>
        <p className="text-sm text-white/80">{c.text}</p>
        <button onClick={() => vote(c.id)} aria-pressed={voted.includes(c.id)} className={`mt-3 inline-flex h-9 items-center gap-2 border px-3 text-xs ${voted.includes(c.id) ? 'border-ac text-ac' : 'border-white/20 text-white/60'}`}><ThumbsUp size={14} />Helpful ({c.likes + (voted.includes(c.id) ? 1 : 0)})</button></li>)}</ul>
    </section>
  )
}
