import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4 text-center">
      <span className="text-2xl font-bold text-slate-900">EarnHub</span>
      <p className="max-w-md text-slate-500">
        Complete tasks, earn rewards. Full landing page design coming in a later step.
      </p>
      <div className="flex gap-3">
        <Link to="/signup">
          <Button>Get started</Button>
        </Link>
        <Link to="/login">
          <Button variant="secondary">Log in</Button>
        </Link>
      </div>
    </div>
  )
}
