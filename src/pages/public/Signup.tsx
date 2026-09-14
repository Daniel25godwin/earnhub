import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import {
  completeSignup,
  ensureUserDoc,
  applyReferralCode,
  UsernameTakenError,
} from '@/lib/accountProvisioning'
import { signupSchema, type SignupFormValues } from '@/lib/validation/auth'
import { getFirebaseAuthErrorMessage } from '@/lib/firebaseErrors'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

export default function Signup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const referralCode = searchParams.get('ref')

  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(values: SignupFormValues) {
    setFormError(null)
    setIsSubmitting(true)

    try {
      // If a previous attempt already created the Auth account but failed at the
      // username-reservation step (e.g. username taken), reuse that session instead
      // of trying to create a duplicate account.
      if (!auth.currentUser || auth.currentUser.email !== values.email) {
        await createUserWithEmailAndPassword(auth, values.email, values.password)
      }

      try {
        await completeSignup(
          auth.currentUser!.uid,
          values.username,
          values.email,
          auth.currentUser!.emailVerified
        )
      } catch (err) {
        if (err instanceof UsernameTakenError) {
          setError('username', { message: err.message })
          setIsSubmitting(false)
          return
        }
        throw err
      }

      if (referralCode) {
        try {
          await applyReferralCode(auth.currentUser!.uid, referralCode)
        } catch {
          // Non-critical — don't block signup if the referral code is invalid/expired.
        }
      }

      await sendEmailVerification(auth.currentUser!, {
        url: `${window.location.origin}/login`,
      })

      setEmailSentTo(values.email)
    } catch (err) {
      setFormError(getFirebaseAuthErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleSignup() {
    setFormError(null)
    setIsGoogleLoading(true)
    try {
      const credential = await signInWithPopup(auth, googleProvider)
      await ensureUserDoc(credential.user.uid, credential.user.email ?? '', credential.user.photoURL)
      if (referralCode) {
        try {
          await applyReferralCode(credential.user.uid, referralCode)
        } catch {
          // Non-critical.
        }
      }
      navigate('/dashboard')
    } catch (err) {
      setFormError(getFirebaseAuthErrorMessage(err))
    } finally {
      setIsGoogleLoading(false)
    }
  }

  if (emailSentTo) {
    return (
      <AuthLayout title="Check your email">
        <div className="space-y-4">
          <Alert variant="success">
            We sent a verification link to <strong>{emailSentTo}</strong>. Click it to
            activate your account, then log in.
          </Alert>
          <Button variant="secondary" className="w-full" onClick={() => navigate('/login')}>
            Go to login
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start earning in minutes">
      <div className="space-y-5">
        {formError && <Alert variant="error">{formError}</Alert>}

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          isLoading={isGoogleLoading}
          onClick={handleGoogleSignup}
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
            label="Username"
            placeholder="yourname"
            error={errors.username?.message}
            {...register('username')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm password"
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
