import { useState } from 'react'
import { Check, Copy, Share2, Users } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { BackButton } from '@/components/BackButton'

// TODO: replace with the signed-in user's real code from the backend.
const REFERRAL_CODE = 'TASKR-0000'

export default function Referrals() {
  const [copied, setCopied] = useState(false)

  const link = `${window.location.origin}/signup?ref=${REFERRAL_CODE}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked — the input below is selectable as a fallback.
    }
  }

  async function shareLink() {
    if (!navigator.share) {
      copyLink()
      return
    }
    try {
      await navigator.share({ title: 'Join me', text: 'Earn by completing tasks.', url: link })
    } catch {
      // User dismissed the share sheet.
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
      <BackButton />

      <div>
        <p className="text-sm font-medium text-brand-600">Referrals</p>
        <h1 className="text-2xl font-semibold text-slate-900">Invite a friend</h1>
        <p className="mt-1 text-sm text-slate-500">
          Share your link. Anyone who signs up with it is linked to your account.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label htmlFor="ref-link" className="text-xs text-slate-500">
          Your invite link
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="ref-link"
            readOnly
            value={link}
            onFocus={(e) => e.target.select()}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-brand-300 hover:text-brand-700"
            >
              {copied ? <Check className="h-4 w-4 text-success-500" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={shareLink}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-medium text-slate-900">People you&rsquo;ve invited</h2>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="rounded-full bg-slate-100 p-3">
            <Users className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No one has joined with your link yet.</p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
