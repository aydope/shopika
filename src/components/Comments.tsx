import { useState } from 'react'
import { Rating } from '@mui/material'
import { ThumbsUp } from 'lucide-react'
import { useStore } from '@/store'
import { useAuth } from '@/auth'
import { hasErrors, hasMinLength, type FormErrors } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import type { Review } from '@/data/products'
import { useTransientFlag } from './Utils'

type CommentField = 'name' | 'text' | 'rating'
const CONFIRMATION_MS = 3000
const newCommentId = () => `c${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

/** Comment thread for a product or article. `threadKey` identifies the thread; `rated` adds a star rating. */
export function Comments({ threadKey, initialReviews, rated = false }: { threadKey: string; initialReviews: Review[]; rated?: boolean }) {
  const { comments, addComment, voted, toggleVote } = useStore()
  const user = useAuth((s) => s.user)
  const [name, setName] = useState(user?.name ?? '')
  const [text, setText] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [errors, setErrors] = useState<FormErrors<CommentField>>({})
  const [posted, showPosted] = useTransientFlag(CONFIRMATION_MS)
  const noun = rated ? 'review' : 'comment'
  const thread = [...(comments[threadKey] ?? []), ...initialReviews]

  const submit = () => {
    const found: FormErrors<CommentField> = {}
    if (!hasMinLength(name, 2)) found.name = 'Please enter your name'
    if (!hasMinLength(text, 5)) found.text = 'Write at least 5 characters'
    if (rated && rating === null) found.rating = 'Please choose a rating'
    setErrors(found)
    if (hasErrors(found)) return
    addComment(threadKey, { id: newCommentId(), name: name.trim(), text: text.trim(), date: new Date().toISOString().slice(0, 10), rating: rated ? (rating ?? undefined) : undefined, likes: 0 })
    setText('')
    setRating(null)
    showPosted()
  }

  return (
    <section aria-label={rated ? 'Reviews' : 'Comments'}>
      <h3 className="display mb-4 text-lg">{rated ? 'Reviews' : 'Comments'} ({thread.length})</h3>
      <form noValidate onSubmit={(e) => { e.preventDefault(); submit() }} className="mb-8 space-y-3 border-2 border-white/10 p-4">
        <Field label="Name" autoComplete="name" value={name} onChange={setName} error={errors.name} />
        {rated && (
          <div>
            <p className="text-sm">Your rating</p>
            <Rating value={rating} onChange={(_, value) => setRating(value)} />
            {errors.rating && <p role="alert" className="text-sm text-ac2">{errors.rating}</p>}
          </div>
        )}
        <Field label={`Your ${noun}`} multiline rows={3} value={text} onChange={setText} error={errors.text} />
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm">Post {noun}</Button>
          {posted && <span role="status" className="text-sm text-ac">Thanks, your {noun} was posted</span>}
        </div>
      </form>
      <ul className="space-y-4">
        {thread.map((comment) => {
          const hasVoted = voted.includes(comment.id)
          return (
            <li key={comment.id} className="border border-white/10 p-4">
              <div className="mb-2 flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center bg-ac font-black text-black">{comment.name[0]?.toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <b className="block text-sm">{comment.name}</b>
                  <span className="text-xs text-white/50">{comment.date}</span>
                </div>
                {comment.rating && <Rating value={comment.rating} readOnly size="small" />}
              </div>
              <p className="text-sm text-white/80">{comment.text}</p>
              <button type="button" onClick={() => toggleVote(comment.id)} aria-pressed={hasVoted} className={`mt-3 inline-flex h-9 items-center gap-2 border px-3 text-xs ${hasVoted ? 'border-ac text-ac' : 'border-white/20 text-white/60'}`}>
                <ThumbsUp size={14} />Helpful ({comment.likes + (hasVoted ? 1 : 0)})
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
