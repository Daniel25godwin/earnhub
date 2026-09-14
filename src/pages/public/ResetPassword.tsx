import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validation/auth'
import { getFirebaseAuthErrorMessage } from '@/lib/firebaseErrors'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

type LinkState = 'verifying' | 'valid' | 'invalid' | 'done'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const oobCode = searchParams.get('oobCode')

  const [linkState, setLinkState] = useState<LinkState>(oobCode ? 'verifying' : 'invalid')
  const [accountEmail, setAccountEmail] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    if (!oobCode) return

    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setAccountEmail(email)
        setLinkState('valid')
      })
      .catch(() => setLinkState('invalid'))
  }, [oobCode])

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!oobCode) return
    setFormError(null)
    setIsSubmitting(true)
    try {
      await confirmPasswordReset(auth, oobCode, values.password)
      setLinkState('done')
    } catch (err) {
      setFormError(getFirebaseAuthErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (linkState === 'verifying') {
    return (
      <AuthLayout title="Verifying link…">
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      </AuthLayout>
    )
  }

  if (linkState === 'invalid') {
    return (
      <AuthLayout title="Link expired or invalid">
        <div className="space-y-4">
          <Alert variant="error">
            This password reset link is invalid or has expired. Please request a new one.
          </Alert>
          <Link to="/forgot-password">
            <Button className="w-full">Request a new link</Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  if (linkState === 'done') {
    return (
      <AuthLayout title="Password updated">
        <div className="space-y-4">
          <Alert variant="success">
            Your password has been changed. You can now log in with your new password.
          </Alert>
          <Button className="w-full" onClick={() => navigate('/login')}>
            Go to login
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Set a new password" subtitle={accountEmail ?? undefined}>
      <div className="space-y-5">
        {formError && <Alert variant="error">{formError}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="New password"
            type="password"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm new password"
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Update password
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
