import type { Metadata } from 'next'
import { ResetView } from '@/components/accounts/invite-view'

export const metadata: Metadata = { title: 'Reset password · Certus' }

export default function ResetPage() {
  return <ResetView />
}
