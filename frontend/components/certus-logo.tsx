'use client'

import { cn } from '@/lib/utils'

interface CertusLogoProps {
  className?: string
  size?: number
  /**
   * mark     the lock alone
   * glyph    the same, for a tile or ground drawn by the caller
   * compact  the lock and the name
   * full     the lock, the name and the product line
   */
  variant?: 'mark' | 'glyph' | 'compact' | 'full'
  /** color: the core in the action lime. mono: one flat tone in the text colour. */
  tone?: 'color' | 'mono'
  iconClassName?: string
  /** Play the lock-on once when the mark first draws (the landing's header and hero only). */
  intro?: boolean
}

/*
 * The CERTUS mark: the precision engineering caliper C locked on an ASME diamond proof seal.
 *
 * The outer contour forms the letter C with chamfered 45° industrial edges and measuring
 * caliper jaws on the open right edge. The centered diamond represents the ASME Code Symbol
 * Stamp and the mathematical Q.E.D. / cryptographic Ed25519 hash seal ("Answers your plant can prove").
 *
 * Drawn on a 48-unit grid. The caliper frame takes currentColor (text-foreground),
 * while the diamond core takes --mark-core (lime #d4f24a at night, deep olive by day).
 */
const CALIPER_C = 'M38 10H18L10 18V30L18 38H38M38 10V16M38 38V32'
const DIAMOND_POINTS = '24,15 33,24 24,33 15,24'

export function CertusMark({
  size = 24,
  className,
  tone = 'color',
  intro = false,
}: {
  size?: number
  className?: string
  tone?: 'color' | 'mono'
  intro?: boolean
}) {
  const stroke = (Math.max(1.25, size / 32) * 48) / size
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden
      className={cn('shrink-0', intro && 'hv-mark-intro', className)}
    >
      <path className="hv-mark-brackets" d={CALIPER_C} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="square" strokeLinejoin="miter" />
      <polygon className="hv-mark-core" points={DIAMOND_POINTS} fill={tone === 'mono' ? 'currentColor' : 'var(--mark-core, #d4f24a)'} />
    </svg>
  )
}

export function CertusLogo({ className, size = 32, variant = 'full', tone = 'color', iconClassName, intro }: CertusLogoProps) {
  const icon = <CertusMark size={size} tone={tone} intro={intro} className={cn(variant !== 'glyph' && 'text-foreground', iconClassName)} />

  if (variant === 'mark' || variant === 'glyph') return <span className={cn('inline-flex', className)}>{icon}</span>

  return (
    <div className={cn('inline-flex select-none items-center gap-2.5', className)}>
      {icon}
      <div className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-[0.14em] [font-stretch:112%] text-foreground">CERTUS</span>
        {variant === 'full' && <span className="mt-[3px] text-[11px] text-foreground-muted">Agentic workbench</span>}
      </div>
    </div>
  )
}
