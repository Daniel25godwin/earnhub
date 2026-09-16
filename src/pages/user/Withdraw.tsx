import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock3, Loader2 } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { BackButton } from '@/components/BackButton'
import { LiveWithdrawals } from '@/components/LiveWithdrawals'
import { formatMoney } from '@/lib/format'
import { useWallet } from '@/lib/wallet-store'
import { TASKS } from '@/data/tasks'

const MIN_WITHDRAWAL = 1000
const REQUEST_KEY = 'withdraw:request'

const BANKS = [
  'Access Bank',
  'Citibank',
  'Ecobank',
  'Fidelity Bank',
  'First Bank of Nigeria',
  'First City Monument Bank',
  'Guaranty Trust Bank',
  'Jaiz Bank',
  'Keystone Bank',
  'Kuda Microfinance Bank',
  'Moniepoint MFB',
  'OPay',
  'PalmPay',
  'Polaris Bank',
  'Providus Bank',
  'Stanbic IBTC Bank',
  'Sterling Bank',
  'Union Bank of Nigeria',
  'United Bank for Africa',
  'Unity Bank',
  'Wema Bank',
  'Zenith Bank',
]

type WithdrawRequest = {
  bank: string
  accountNumber: string
  accountName: string
  amount: number
  status: 'awaiting_payment'
  requestedAt: number
}

function loadRequest(): WithdrawRequest | null {
  try {
    const raw = localStorage.getItem(REQUEST_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveRequest(req: WithdrawRequest) {
  try {
    localStorage.setItem(REQUEST_KEY, JSON.stringify(req))
  } catch {
    // ignore storage failures
  }
}

export default function Withdraw() {
  const wallet = useWallet()

  const [bank, setBank] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [request, setRequest] = useState<WithdrawRequest | null>(loadRequest)

  // Derived from credited tasks until there's a real server balance.
  const balance = useMemo(
    () =>
      TASKS.filter((t) => wallet.isTaskCompleted(t.id)).reduce((s, t) => s + t.rewardAmount, 0),
    [wallet],
  )

  const numberValid = /^\d{10}$/.test(accountNumber)
  const belowMinimum = balance < MIN_WITHDRAWAL
  const canSubmit = Boolean(bank) && numberValid && accountName.trim().length > 1 && !belowMinimum

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)

    // TODO: replace with a POST to the payouts endpoint once the backend
    // exists. For now the request is saved locally so it isn't lost, and
    // marked "awaiting_payment" for the team to pick up and pay out
    // manually at month end.
    const req: WithdrawRequest = {
      bank,
      accountNumber,
      accountName,
      amount: balance,
      status: 'awaiting_payment',
      requestedAt: Date.now(),
    }
    saveRequest(req)
    setRequest(req)
    setSubmitting(false)
  }

  const fieldClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100'

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
      <BackButton />

      <div>
        <p className="text-sm font-medium text-brand-600">Withdraw</p>
        <h1 className="text-2xl font-semibold text-slate-900">Cash out your balance</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs text-slate-500">Available balance</p>
        <p className="mt-1 text-3xl font-semibold text-slate-900">{formatMoney(balance)}</p>
        <p className="mt-2 text-xs text-slate-500">
          Minimum withdrawal is {formatMoney(MIN_WITHDRAWAL)}. Payments go out at month end.
        </p>
      </div>

      {request ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              <Clock3 className="h-3.5 w-3.5" />
              Awaiting payment
            </span>
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Amount</dt>
              <dd className="font-medium text-slate-900">{formatMoney(request.amount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Bank</dt>
              <dd className="font-medium text-slate-900">{request.bank}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Account number</dt>
              <dd className="font-medium text-slate-900">{request.accountNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Account name</dt>
              <dd className="font-medium text-slate-900">{request.accountName}</dd>
            </div>
          </dl>

          <p className="mt-4 text-xs text-slate-500">
            You&rsquo;ll be paid at month end. We&rsquo;ll update this once it&rsquo;s sent.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium text-slate-900">Where should the money go?</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="bank" className="text-xs text-slate-500">
                Bank
              </label>
              <select
                id="bank"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className={`mt-1 ${fieldClass}`}
              >
                <option value="">Select your bank</option>
                {BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="account-number" className="text-xs text-slate-500">
                Account number
              </label>
              <input
                id="account-number"
                inputMode="numeric"
                autoComplete="off"
                maxLength={10}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10 digits"
                className={`mt-1 ${fieldClass}`}
              />
              {accountNumber.length > 0 && !numberValid && (
                <p className="mt-1 text-xs text-rose-600">Account numbers are 10 digits.</p>
              )}
            </div>

            <div>
              <label htmlFor="account-name" className="text-xs text-slate-500">
                Account name
              </label>
              <input
                id="account-name"
                autoComplete="off"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Name exactly as your bank has it"
                className={`mt-1 ${fieldClass}`}
              />
            </div>
          </div>

          {belowMinimum && (
            <p className="mt-4 text-sm text-slate-500">
              You need {formatMoney(MIN_WITHDRAWAL - balance)} more before you can withdraw.{' '}
              <Link to="/earn" className="font-medium text-brand-600 hover:text-brand-700">
                Find a task
              </Link>
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Withdraw
          </button>
        </div>
      )}

      <LiveWithdrawals />

      <BottomNav />
    </div>
  )
}
