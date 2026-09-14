import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { ensureUserDoc } from '@/lib/accountProvisioning'
import { loginSchema, type LoginFormValues } from '@/lib/validation/auth'
import { getFirebaseAuthErrorMessage } from '@/lib/firebaseErrors'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: Location } | null)?.from?.pathname ?? '/dashboard'

  const [formError, setFormError] = useState<string | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    setFormError(null)
    setNeedsVerification(false)
    setIsSubmitting(true)

    try {
      const credential = await signInWithEmailAndPassword(auth, values.email, values.password)

      if (!credential.user.emailVerified) {
        setNeedsVerification(true)
        setIsSubmitting(false)
        return
      }

      navigate(redirectTo, { replace: true })
    } catch (err) {
      setFormError(getFirebaseAuthErrorMessage(err))
      setIsSubmitting(false)
    }
  }

  async function handleResendVerification() {
    if (!auth.currentUser) return
    await sendEmailVerification(auth.currentUser, { url: `${window.location.origin}/login` })
    setResendSent(true)
  }

  async function handleGoogleLogin() {
    setFormError(null)
    setIsGoogleLoading(true)
    try {
      const credential = await signInWithPopup(auth, googleProvider)
      await ensureUserDoc(credential.user.uid, credential.user.email ?? '', credential.user.photoURL)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setFormError(getFirebaseAuthErrorMessage(err))
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to keep earning">
      <div className="space-y-5">
        {formError && <Alert variant="error">{formError}</Alert>}

        {needsVerification && (
          <Alert variant="info">
            Please verify your email before logging in.{' '}
            {resendSent ? (
              <span className="font-medium">Verification email resent.</span>
            ) : (
              <button
                type="button"
                onClick={handleResendVerification}
                className="font-medium underline underline-offset-2"
              >
                Resend verification email
              </button>
            )}
          </Alert>
        )}

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          isLoading={isGoogleLoading}
          onClick={handleGoogleLogin}
        >
          Continue with Google
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium text-slate-400">OR</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <div className="space-y-1.5">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                Forgot password?
              </Link>
            </div>
          </div>
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Log in
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium text-brand-600 hover:text-brand-700">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
