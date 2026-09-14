import { BackButton } from '@/components/BackButton'

export default function Profile() {
  return (
    <div className="min-h-[60vh] p-4 sm:p-6 lg:p-8">
      <BackButton />
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm font-medium text-brand-600">Coming in the next step</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Profile</h1>
        </div>
      </div>
    </div>
  )
}
