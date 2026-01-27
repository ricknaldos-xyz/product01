'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import AdminProductForm from '@/components/admin/AdminProductForm'
import AdminImageUploader from '@/components/admin/AdminImageUploader'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function AdminEditProductoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchProduct = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/shop/products/${id}`)
      if (res.ok) {
        setProduct(await res.json())
      } else {
        toast.error('Producto no encontrado')
        router.push('/admin/tienda')
      }
    } catch {
      toast.error('Error al cargar producto')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  const handleSubmit = async (data: Record<string, unknown>) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/shop/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Error al actualizar producto')
        return
      }

      toast.success('Producto actualizado correctamente')
      fetchProduct()
    } catch {
      toast.error('Error al actualizar producto')
    } finally {
      setSaving(false)
    }
  }

  const handleAddImage = async (url: string) => {
    try {
      const res = await fetch(`/api/admin/shop/products/${id}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (res.ok) {
        toast.success('Imagen agregada')
        fetchProduct()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al agregar imagen')
      }
    } catch {
      toast.error('Error al agregar imagen')
    }
  }

  const handleRemoveImage = async (url: string) => {
    try {
      const res = await fetch(`/api/admin/shop/products/${id}/images`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (res.ok) {
        toast.success('Imagen eliminada')
        fetchProduct()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al eliminar imagen')
      }
    } catch {
      toast.error('Error al eliminar imagen')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <GlassButton variant="ghost" size="sm" onClick={() => router.push('/admin/tienda')}>
          <ArrowLeft className="h-4 w-4" />
        </GlassButton>
        <div>
          <h1 className="text-2xl font-bold">Editar producto</h1>
          <p className="text-muted-foreground text-sm">{product.name as string}</p>
        </div>
      </div>

      <GlassCard intensity="medium">
        <AdminImageUploader
          images={(product.images as string[]) || []}
          onAdd={handleAddImage}
          onRemove={handleRemoveImage}
        />
      </GlassCard>

      <AdminProductForm
        initialData={product as unknown as Parameters<typeof AdminProductForm>[0]['initialData']}
        onSubmit={handleSubmit}
        loading={saving}
      />
    </div>
  )
}
