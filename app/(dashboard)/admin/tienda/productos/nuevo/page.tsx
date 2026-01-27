'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import AdminProductForm from '@/components/admin/AdminProductForm'
import { ArrowLeft } from 'lucide-react'
import { GlassButton } from '@/components/ui/glass-button'

export default function AdminNuevoProductoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: Record<string, unknown>) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/shop/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Error al crear producto')
        return
      }

      toast.success('Producto creado correctamente')
      router.push('/admin/tienda')
    } catch {
      toast.error('Error al crear producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <GlassButton variant="ghost" size="sm" onClick={() => router.push('/admin/tienda')}>
          <ArrowLeft className="h-4 w-4" />
        </GlassButton>
        <div>
          <h1 className="text-2xl font-bold">Nuevo producto</h1>
          <p className="text-muted-foreground text-sm">Crear un nuevo producto para la tienda</p>
        </div>
      </div>

      <AdminProductForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
