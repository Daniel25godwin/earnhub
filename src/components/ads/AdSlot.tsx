// Suggested location: src/components/ads/AdSlot.tsx
//
// Renders a container-based Adsterra unit (Banner, Native Banner, etc.)
// into a specific spot on the page. Adsterra's snippets pair an
// `atOptions` config object with a loader script — pass both through.

import { useEffect, useRef } from 'react'

interface AdSlotProps {
  /** The atOptions config object from Adsterra's "GET CODE" snippet, if any */
  options?: Record<string, unknown>
  /** The loader script src from the snippet */
  scriptSrc: string
  className?: string
}

export function AdSlot({ options, scriptSrc, className }: AdSlotProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    container.innerHTML = ''

    if (options) {
      const optionsScript = document.createElement('script')
      optionsScript.type = 'text/javascript'
      optionsScript.text = `atOptions = ${JSON.stringify(options)};`
      container.appendChild(optionsScript)
    }

    const loaderScript = document.createElement('script')
    loaderScript.type = 'text/javascript'
    loaderScript.src = scriptSrc
    loaderScript.async = true
    container.appendChild(loaderScript)
  }, [scriptSrc, options])

  return <div ref={ref} className={`overflow-hidden ${className ?? ''}`} />
}
