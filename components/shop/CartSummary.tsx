'use client'

interface CartSummaryProps {
  subtotalCents: number
  shippingCents: number
  discountCents?: number
  totalCents: number
}

function formatPrice(cents: number): string {
  return `S/ ${(cents / 100).toFixed(2)}`
}

export function CartSummary({
  subtotalCents,
  shippingCents,
  discountCents,
  totalCents,
}: CartSummaryProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{formatPrice(subtotalCents)}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Envio</span>
        <span>{shippingCents === 0 ? 'Gratis' : formatPrice(shippingCents)}</span>
      </div>
      {discountCents && discountCents > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Descuento</span>
          <span className="text-success">-{formatPrice(discountCents)}</span>
        </div>
      )}
      <div className="border-t border-glass-border-light pt-2 mt-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg">Total</span>
          <span className="font-bold text-lg">{formatPrice(totalCents)}</span>
        </div>
      </div>
    </div>
  )
}
