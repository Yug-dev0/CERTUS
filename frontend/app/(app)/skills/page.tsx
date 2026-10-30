import type { Metadata } from 'next'
import { SkillsView } from '@/features/skills/ui/skills-view'

export const metadata: Metadata = { title: 'Skills · Certus' }

export default function SkillsPage() {
  return <SkillsView />
}
