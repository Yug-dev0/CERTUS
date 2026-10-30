import type { Metadata } from 'next'
import { AdminAccessView } from '@/components/accounts/admin-access-view'

export const metadata: Metadata = { title: 'People · Certus' }

export default function AdminAccessPage() {
  return <AdminAccessView />
}
