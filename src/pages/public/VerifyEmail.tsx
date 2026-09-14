import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { applyActionCode } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { markEmailVerified } from '@/lib/accountProvisioning'
import { getFirebaseAuthErrorMessage } from '@/lib/firebaseErrors'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

type VerifyState = 'verifying' | 'success' | 'error'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const oobCode = searchParams.get('oobCode')

  const [state, setState] = useState<VerifyState>(oobCode ? 'verifying' : 'error')
  const [errorMessage, setErrorMessage] = useState<string | null>(
    oobCode ? null : 'This verification link is missing required information.'
  )

  useEffect(() => {
    if (!oobCode) return

    async function verify() {
      try {
        await applyActionCode(auth, oobCode!)

        // Refresh the local auth user object so emailVerified reflects the change,
        // then flip users/{uid}.status to active directly in Firestore.
        if (auth.currentUser) {
          await auth.currentUser.reload()
          await markEmailVerified(auth.currentUser.uid)
        }

        setState('success')
      } catch (err) {
        setState('error')
        setErrorMessage(getFirebaseAuthErrorMessage(err))
      }
    }

    verify()
  }, [oobCode])

  if (state === 'verifying') {
    return (
      <AuthLayout title="Verifying your email…">
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      </AuthLayout>
    )
  }

  if (state === 'error') {
    return (
      <AuthLayout title="Verification failed">
        <div className="space-y-4">
          <Alert variant="error">{errorMessage}</Alert>
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
    <AuthLayout title="Email verified">
      <div className="space-y-4">
        <Alert variant="success">Your email has been verified. Your account is now active.</Alert>
        <Link to="/login">
          <Button className="w-full">Continue to login</Button>
        </Link>
      </div>
    </AuthLayout>
  )
}
