'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { StringingServiceCard } from '@/components/stringing/StringingServiceCard'
import { DeliveryModeSelector } from '@/components/stringing/DeliveryModeSelector'
import { RacketInfoForm } from '@/components/stringing/RacketInfoForm'
import { StringSelector } from '@/components/stringing/StringSelector'
import { TensionInput } from '@/components/stringing/TensionInput'
import { WorkshopSelector } from '@/components/stringing/WorkshopSelector'
import { CoverageChecker } from '@/components/stringing/CoverageChecker'
import { SchedulePicker } from '@/components/stringing/SchedulePicker'
import { formatPrice } from '@/lib/shop'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Loader2, CreditCard } from 'lucide-react'

type ServiceType = 'STANDARD' | 'EXPRESS'
type DeliveryMode = 'HOME_PICKUP_DELIVERY' | 'WORKSHOP_DROP_PICKUP'

const SERVICE_PRICES: Record<ServiceType, number> = {
  STANDARD: 2500,
  EXPRESS: 4500,
}

const DELIVERY_PRICES: Record<DeliveryMode, number> = {
  HOME_PICKUP_DELIVERY: 1500,
  WORKSHOP_DROP_PICKUP: 0,
}

const STEP_LABELS = [
  'Servicio',
  'Raqueta',
  'Cuerda',
  'Entrega',
  'Confirmar',
]

export default function SolicitarEncordadoPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  // Step 1
  const [serviceType, setServiceType] = useState<ServiceType>('STANDARD')
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('HOME_PICKUP_DELIVERY')

  // Step 2
  const [racketBrand, setRacketBrand] = useState('')
  const [racketModel, setRacketModel] = useState('')
  const [racketNotes, setRacketNotes] = useState('')

  // Step 3
  const [stringName, setStringName] = useState('')
  const [tensionMain, setTensionMain] = useState(55)
  const [tensionCross, setTensionCross] = useState<number | undefined>(undefined)
  const [sameTension, setSameTension] = useState(true)

  // Step 4
  const [workshopId, setWorkshopId] = useState('')
  const [pickupAddress, setPickupAddress] = useState('')
  const [pickupDistrict, setPickupDistrict] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryDistrict, setDeliveryDistrict] = useState('')
  const [preferredPickupDate, setPreferredPickupDate] = useState('')

  // Step 5
  const [contactPhone, setContactPhone] = useState('')

  const totalCents = SERVICE_PRICES[serviceType] + DELIVERY_PRICES[deliveryMode]

  function canGoNext(): boolean {
    switch (step) {
      case 0:
        return !!serviceType && !!deliveryMode
      case 1:
        return racketBrand.trim().length > 0 && racketModel.trim().length > 0
      case 2:
        return stringName.trim().length > 0 && tensionMain >= 30 && tensionMain <= 80
      case 3:
        if (deliveryMode === 'WORKSHOP_DROP_PICKUP') return !!workshopId
        return pickupAddress.trim().length > 0 && pickupDistrict.trim().length > 0
      case 4:
        return contactPhone.trim().length >= 6
      default:
        return false
    }
  }

  async function handleSubmit() {
    if (!canGoNext()) return

    setSubmitting(true)
    try {
      // Create order
      const orderRes = await fetch('/api/stringing/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          deliveryMode,
          racketBrand: racketBrand.trim(),
          racketModel: racketModel.trim(),
          racketNotes: racketNotes.trim() || undefined,
          stringName: stringName.trim(),
          tensionMain,
          tensionCross: sameTension ? undefined : tensionCross,
          workshopId: deliveryMode === 'WORKSHOP_DROP_PICKUP' ? workshopId : undefined,
          pickupAddress: deliveryMode === 'HOME_PICKUP_DELIVERY' ? pickupAddress.trim() : undefined,
          pickupDistrict: deliveryMode === 'HOME_PICKUP_DELIVERY' ? pickupDistrict : undefined,
          deliveryAddress: deliveryMode === 'HOME_PICKUP_DELIVERY' ? (deliveryAddress.trim() || pickupAddress.trim()) : undefined,
          deliveryDistrict: deliveryMode === 'HOME_PICKUP_DELIVERY' ? (deliveryDistrict || pickupDistrict) : undefined,
          contactPhone: contactPhone.trim(),
          preferredPickupDate: preferredPickupDate || undefined,
        }),
      })

      if (!orderRes.ok) {
        const err = await orderRes.json()
        toast.error(err.error || 'Error al crear pedido')
        return
      }

      const { id: orderId } = await orderRes.json()

      // Create checkout session
      const checkoutRes = await fetch('/api/stringing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      if (!checkoutRes.ok) {
        const err = await checkoutRes.json()
        toast.error(err.error || 'Error al crear sesion de pago')
        router.push(`/encordado/pedidos/${orderId}`)
        return
      }

      const { checkoutUrl } = await checkoutRes.json()
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      } else {
        toast.error('No se pudo obtener la URL de pago')
        router.push(`/encordado/pedidos/${orderId}`)
      }
    } catch {
      toast.error('Error inesperado al procesar el pedido')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Solicitar Encordado</h1>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i < step
                    ? 'bg-primary text-primary-foreground'
                    : i === step
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1}
              </div>
              <span className="text-xs mt-1 text-muted-foreground hidden sm:block">{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-0.5 flex-1 ${i < step ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <GlassCard intensity="medium" padding="lg">
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Tipo de Servicio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StringingServiceCard type="STANDARD" selected={serviceType === 'STANDARD'} onSelect={() => setServiceType('STANDARD')} />
                <StringingServiceCard type="EXPRESS" selected={serviceType === 'EXPRESS'} onSelect={() => setServiceType('EXPRESS')} />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-3">Modo de Entrega</h2>
              <DeliveryModeSelector selected={deliveryMode} onSelect={setDeliveryMode} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Informacion de la Raqueta</h2>
            <RacketInfoForm
              brand={racketBrand}
              model={racketModel}
              notes={racketNotes}
              onChange={(field, value) => {
                if (field === 'brand') setRacketBrand(value)
                else if (field === 'model') setRacketModel(value)
                else if (field === 'notes') setRacketNotes(value)
              }}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Seleccion de Cuerda</h2>
            <StringSelector
              stringName={stringName}
              onStringNameChange={setStringName}
            />
            <TensionInput
              tensionMain={tensionMain}
              tensionCross={tensionCross}
              onMainChange={setTensionMain}
              onCrossChange={setTensionCross}
              sameTension={sameTension}
              onSameTensionChange={setSameTension}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Detalles de Entrega</h2>

            {deliveryMode === 'HOME_PICKUP_DELIVERY' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Direccion de Recojo *</label>
                  <input
                    type="text"
                    className="glass-input w-full"
                    placeholder="Av. Example 123, Dpto 4B"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                  />
                </div>

                <CoverageChecker
                  district={pickupDistrict}
                  onDistrictChange={setPickupDistrict}
                />

                <div>
                  <label className="block text-sm font-medium mb-1">Direccion de Entrega (dejar vacio si es la misma)</label>
                  <input
                    type="text"
                    className="glass-input w-full"
                    placeholder="Misma direccion de recojo"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>

                {deliveryAddress.trim() && (
                  <CoverageChecker
                    district={deliveryDistrict}
                    onDistrictChange={setDeliveryDistrict}
                  />
                )}

                <SchedulePicker
                  date={preferredPickupDate}
                  onDateChange={setPreferredPickupDate}
                />
              </div>
            ) : (
              <WorkshopSelector
                selectedId={workshopId}
                onSelect={setWorkshopId}
              />
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Confirmar Pedido</h2>

            {/* Summary */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Servicio</span>
                <span className="font-medium">{serviceType === 'STANDARD' ? 'Estandar' : 'Express'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Entrega</span>
                <span className="font-medium">{deliveryMode === 'HOME_PICKUP_DELIVERY' ? 'A Domicilio' : 'En Taller'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Raqueta</span>
                <span className="font-medium">{racketBrand} {racketModel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cuerda</span>
                <span className="font-medium">{stringName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tension</span>
                <span className="font-medium">
                  {tensionMain} lbs
                  {!sameTension && tensionCross ? ` / ${tensionCross} lbs` : ' (uniforme)'}
                </span>
              </div>

              {deliveryMode === 'HOME_PICKUP_DELIVERY' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recojo</span>
                    <span className="font-medium">{pickupAddress} - {pickupDistrict}</span>
                  </div>
                  {preferredPickupDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fecha preferida</span>
                      <span className="font-medium">{new Date(preferredPickupDate).toLocaleDateString('es-PE')}</span>
                    </div>
                  )}
                </>
              )}

              <hr className="border-glass" />

              {/* Price Breakdown */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Servicio de encordado</span>
                <span>{formatPrice(SERVICE_PRICES[serviceType])}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span>{DELIVERY_PRICES[deliveryMode] === 0 ? 'Gratis' : formatPrice(DELIVERY_PRICES[deliveryMode])}</span>
              </div>
              <hr className="border-glass" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(totalCents)}</span>
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-medium mb-1">Telefono de Contacto *</label>
              <input
                type="tel"
                className="glass-input w-full"
                placeholder="999 123 456"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
          </div>
        )}
      </GlassCard>

      {/* Navigation */}
      <div className="flex justify-between">
        <GlassButton
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Atras
        </GlassButton>

        {step < 4 ? (
          <GlassButton
            variant="solid"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canGoNext()}
          >
            Siguiente
            <ArrowRight className="h-4 w-4 ml-2" />
          </GlassButton>
        ) : (
          <GlassButton
            variant="solid"
            onClick={handleSubmit}
            disabled={!canGoNext() || submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CreditCard className="h-4 w-4 mr-2" />
            )}
            Pagar
          </GlassButton>
        )}
      </div>
    </div>
  )
}
