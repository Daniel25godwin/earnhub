import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validation/auth'
import { getFirebaseAuthErrorMessage } from '@/lib/firebaseErrors'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

export default function ForgotPassword() {
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    setFormError(null)
    setIsSubmitting(true)
    try {
      await sendPasswordResetEmail(auth, values.email, {
        url: `${window.location.origin}/login`,
      })
      setSentTo(values.email)
    } catch (err) {
      // Deliberately show the same success state even on auth/user-not-found,
      // so the form can't be used to enumerate which emails have accounts.
      const code = (err as { code?: string })?.code
      if (code === 'auth/user-not-found') {
        setSentTo(values.email)
      } else {
        setFormError(getFirebaseAuthErrorMessage(err))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (sentTo) {
    return (
      <AuthLayout title="Check your email">
        <div className="space-y-4">
          <Alert variant="success">
            If an account exists for <strong>{sentTo}</strong>, we&apos;ve sent a link to
            reset your password.
          </Alert>
          <Link to="/login">
            <Button variant="secondary" className="w-full">
              Back to login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <div className="space-y-5">
        {formError && <Alert variant="error">{formError}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Send reset link
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500">
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Back to login
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
