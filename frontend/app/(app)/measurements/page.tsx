import type { Metadata } from 'next'
import { MeasurementsView } from '@/features/measurements/ui/measurements-view'

export const metadata: Metadata = { title: 'Measurements · Certus' }

export default function MeasurementsPage() {
  return <MeasurementsView />
}
