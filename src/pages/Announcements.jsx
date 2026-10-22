import { useState } from 'react'
import { addDoc, collection, deleteDoc, doc, increment, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import { useCollection } from '../lib/hooks'
import { teamCol, useAnnouncements } from '../lib/teamData'
import { timeAgo } from '../lib/constants'
import { Avatar, EmptyState, ErrorNote, Icon, PageHeader, RoleBadge, Spinner } from '../components/ui'

export default function Announcements() {
  const { isStaff } = useAuth()
  const { data, loading } = useAnnouncements()
  const sorted = [...data].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned))

  return (
    <>
      <PageHeader title="Announcements" subtitle="Team news from coaches and captains, with replies from everyone." />
      {isStaff && <Composer />}
      {loading ? (
        <Spinner />
      ) : sorted.length === 0 ? (
        <EmptyState icon="megaphone" title="No announcements yet">
          {isStaff ? 'Post the first update above.' : 'Updates from your coaches and captains will show up here.'}
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {sorted.map((a) => <Post key={a.id} post={a} />)}
        </div>
      )}
    </>
  )
}

function Composer() {
  const { user, profile, role, teamId } = useAuth()
  const [form, setForm] = useState({ title: '', body: '', pinned: false })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await addDoc(teamCol(teamId, 'announcements'), {
        title: form.title.trim(),
        body: form.body.trim(),
        pinned: form.pinned,
        authorUid: user.uid,
        authorName: profile.name,
        authorRole: role,
        createdAt: serverTimestamp(),
      })
      setForm({ title: '', body: '', pinned: false })
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="card mb-6 space-y-3 p-4">
      <input className="input font-semibold" placeholder="Announcement title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea className="input" rows={3} placeholder="What does the team need to know?" required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
      <ErrorNote error={error} />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" className="accent-brand-700" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />
          Pin to top
        </label>
        <button className="btn-primary" disabled={busy}>{busy ? 'Posting…' : 'Post'}</button>
      </div>
    </form>
  )
}

function Post({ post }) {
  const { user, profile, isStaff, teamId } = useAuth()
  const [showReplies, setShowReplies] = useState(false)
  const [reply, setReply] = useState('')
  const repliesRef = collection(db, 'teams', teamId, 'announcements', post.id, 'replies')
  const replies = useCollection(showReplies ? query(repliesRef, orderBy('createdAt')) : null, `${post.id}-${showReplies}`)
  const postRef = doc(db, 'teams', teamId, 'announcements', post.id)

  async function sendReply(e) {
    e.preventDefault()
    if (!reply.trim()) return
    await addDoc(repliesRef, { body: reply.trim(), authorUid: user.uid, authorName: profile.name, createdAt: serverTimestamp() })
    await updateDoc(postRef, { replyCount: increment(1) }).catch(() => {})
    setReply('')
  }

  async function removePost() {
    if (confirm('Delete this announcement?')) await deleteDoc(postRef)
  }

  async function removeReply(r) {
    await deleteDoc(doc(repliesRef, r.id))
    await updateDoc(postRef, { replyCount: increment(-1) }).catch(() => {})
  }

  return (
    <article className="card">
      {post.pinned && <p className="cut flex items-center gap-2 border-b-2 border-ink bg-gold px-5 py-1 text-xs"><Icon name="pin" className="h-3.5 w-3.5" /> Pinned</p>}
      <div className="p-5">
      <header className="mb-3 flex items-start gap-3">
        <Avatar name={post.authorName} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold">{post.authorName}</span>
            <RoleBadge role={post.authorRole} />
            <span className="text-xs text-muted">{timeAgo(post.createdAt)}</span>
          </p>
          <h2 className="cut mt-1 text-xl leading-tight">
            {post.title}
          </h2>
        </div>
        {isStaff && (
          <div className="flex">
            <button className="p-2 text-muted hover:bg-board hover:text-brand-700" onClick={() => updateDoc(postRef, { pinned: !post.pinned })} title={post.pinned ? 'Unpin' : 'Pin'} aria-label={post.pinned ? 'Unpin' : 'Pin'}>
              <Icon name="pin" className="h-4 w-4" />
            </button>
            <button className="p-2 text-muted hover:bg-red-50 hover:text-red-700" onClick={removePost} aria-label="Delete announcement">
              <Icon name="trash" className="h-4 w-4" />
            </button>
          </div>
        )}
      </header>
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink">{post.body}</p>

      <button className="mt-4 text-xs font-semibold text-brand-700 hover:underline" onClick={() => setShowReplies((s) => !s)}>
        {showReplies ? 'Hide replies' : post.replyCount ? `View ${post.replyCount} ${post.replyCount === 1 ? 'reply' : 'replies'}` : 'Reply'}
      </button>

      {showReplies && (
        <div className="mt-3 space-y-3 border-t border-rule pt-3">
          {replies.data.map((r) => (
            <div key={r.id} className="flex gap-2">
              <Avatar name={r.authorName} size="sm" />
              <div className="min-w-0 flex-1 bg-board/60 px-3 py-2">
                <p className="text-xs">
                  <span className="font-semibold">{r.authorName}</span>{' '}
                  <span className="text-muted">{timeAgo(r.createdAt)}</span>
                </p>
                <p className="text-sm whitespace-pre-wrap">{r.body}</p>
              </div>
              {(isStaff || r.authorUid === user.uid) && (
                <button className="self-start  p-1 text-muted hover:text-red-700" onClick={() => removeReply(r)} aria-label="Delete reply">
                  <Icon name="x" className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <form onSubmit={sendReply} className="flex gap-2">
            <input className="input" placeholder="Write a reply…" value={reply} onChange={(e) => setReply(e.target.value)} />
            <button className="btn-primary" disabled={!reply.trim()}>Send</button>
          </form>
        </div>
      )}
      </div>
    </article>
  )
}
