import type { Metadata } from 'next'
import { RequestAccessView } from '@/components/accounts/request-access-view'

export const metadata: Metadata = { title: 'Request access · Certus' }

export default function RequestAccessPage() {
  return <RequestAccessView />
}
