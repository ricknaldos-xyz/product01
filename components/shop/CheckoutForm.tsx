'use client'

import { useState } from 'react'
import { GlassButton } from '@/components/ui/glass-button'
import { Loader2 } from 'lucide-react'

const LIMA_DISTRICTS = [
  'Miraflores',
  'San Isidro',
  'Surco',
  'La Molina',
  'San Borja',
  'Barranco',
  'Surquillo',
  'Magdalena',
  'Jesus Maria',
  'Lince',
  'San Miguel',
  'Pueblo Libre',
  'Breña',
  'Lima Cercado',
  'La Victoria',
  'San Luis',
  'Ate',
  'Santa Anita',
  'San Juan de Lurigancho',
  'San Juan de Miraflores',
  'Villa El Salvador',
  'Chorrillos',
  'Comas',
  'Los Olivos',
  'Independencia',
  'San Martin de Porres',
  'Callao',
  'Bellavista',
  'La Perla',
]

interface CheckoutFormData {
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingDistrict: string
  shippingCity: string
  shippingNotes?: string
}

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void
  loading: boolean
}

export function CheckoutForm({ onSubmit, loading }: CheckoutFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [district, setDistrict] = useState('')
  const [notes, setNotes] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      shippingName: name,
      shippingPhone: phone,
      shippingAddress: address,
      shippingDistrict: district,
      shippingCity: 'Lima',
      shippingNotes: notes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1">Nombre completo</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="glass-input w-full"
          placeholder="Tu nombre completo"
          required
          minLength={2}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Telefono</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="glass-input w-full"
          placeholder="+51 999 999 999"
          required
          minLength={6}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Direccion de envio</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="glass-input w-full min-h-[60px]"
          placeholder="Calle, numero, departamento, referencia"
          required
          minLength={5}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Distrito</label>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="glass-input w-full"
          required
        >
          <option value="">Selecciona un distrito</option>
          {LIMA_DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Notas de envio (opcional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="glass-input w-full min-h-[60px]"
          placeholder="Indicaciones adicionales para la entrega"
          maxLength={500}
        />
      </div>

      <GlassButton
        type="submit"
        variant="solid"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Procesando...
          </>
        ) : (
          'Confirmar y pagar'
        )}
      </GlassButton>
    </form>
  )
}
