// Suggested location: src/components/ads/Banner468x60.tsx
//
// Adsterra "Banner 468x60" unit (ad unit id 31254904, site 6054574).
// Fixed-size display banner — renders wherever it's placed.

import { AdSlot } from './AdSlot'

export function Banner468x60({ className }: { className?: string }) {
  return (
    <AdSlot
      className={className ?? 'mx-auto w-[468px] max-w-full'}
      options={{
        key: '430696125983df4767e85969c8acd8c4',
        format: 'iframe',
        height: 60,
        width: 468,
        params: {},
      }}
      scriptSrc="https://www.highrevenueformat.com/430696125983df4767e85969c8acd8c4/invoke.js"
    />
  )
}
