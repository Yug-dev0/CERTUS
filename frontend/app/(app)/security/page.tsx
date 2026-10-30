import type { Metadata } from 'next'
import { SecurityView } from '@/components/security/security-view'

export const metadata: Metadata = { title: 'Assurance · Certus' }

export default function SecurityPage() {
  return <SecurityView />
}
