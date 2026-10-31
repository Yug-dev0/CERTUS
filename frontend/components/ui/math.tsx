'use client'

import { memo, useMemo } from 'react'
import katex from 'katex'
import { cn } from '@/lib/utils'

interface MathProps {
  math: string
  display?: boolean
  className?: string
}

/**
 * Renders mathematical expressions deterministically using KaTeX.
 * 
 * Works in both inline mode (e.g. within sentences) and display mode
 * (centered, standalone step-by-step formula derivations).
 */
export const MathView = memo(function MathView({
  math,
  display = false,
  className,
}: MathProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
        strict: false,
        output: 'htmlAndMathml',
      })
    } catch {
      return null
    }
  }, [math, display])

  if (!html) {
    return (
      <code className={cn('font-mono text-meta text-foreground-secondary', className)}>
        {math}
      </code>
    )
  }

  if (display) {
    return (
      <div
        className={cn(
          'my-2 overflow-x-auto rounded-[var(--radius-sm)] bg-surface-sunken/60 py-2.5 px-3 text-foreground [scrollbar-width:thin]',
          className,
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return (
    <span
      className={cn('inline-block text-foreground', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
})

