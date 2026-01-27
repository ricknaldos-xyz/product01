'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { Save, Loader2, Plus, X } from 'lucide-react'

interface ProductFormData {
  name: string
  slug: string
  description: string
  shortDesc: string
  category: string
  brand: string
  model: string
  priceCents: number
  comparePriceCents: number | null
  costCents: number | null
  stock: number
  sku: string
  isActive: boolean
  isFeatured: boolean
  metaTitle: string
  metaDescription: string
  attributes: Record<string, string>
}

interface AdminProductFormProps {
  initialData?: Partial<ProductFormData> & { priceCents?: number; comparePriceCents?: number | null; costCents?: number | null; attributes?: Record<string, string> | null }
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  loading: boolean
}

const CATEGORIES = [
  { value: 'RACKETS', label: 'Raquetas' },
  { value: 'STRINGS', label: 'Cuerdas' },
  { value: 'GRIPS', label: 'Grips' },
  { value: 'BAGS', label: 'Bolsos' },
  { value: 'SHOES', label: 'Zapatillas' },
  { value: 'APPAREL', label: 'Ropa' },
  { value: 'ACCESSORIES', label: 'Accesorios' },
]

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default function AdminProductForm({ initialData, onSubmit, loading }: AdminProductFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [shortDesc, setShortDesc] = useState(initialData?.shortDesc || '')
  const [category, setCategory] = useState(initialData?.category || 'RACKETS')
  const [brand, setBrand] = useState(initialData?.brand || '')
  const [model, setModel] = useState(initialData?.model || '')
  const [priceDisplay, setPriceDisplay] = useState(
    initialData?.priceCents ? (initialData.priceCents / 100).toFixed(2) : ''
  )
  const [comparePriceDisplay, setComparePriceDisplay] = useState(
    initialData?.comparePriceCents ? (initialData.comparePriceCents / 100).toFixed(2) : ''
  )
  const [costDisplay, setCostDisplay] = useState(
    initialData?.costCents ? (initialData.costCents / 100).toFixed(2) : ''
  )
  const [stock, setStock] = useState(initialData?.stock?.toString() || '0')
  const [sku, setSku] = useState(initialData?.sku || '')
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false)
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || '')
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '')
  const [attributes, setAttributes] = useState<{ key: string; value: string }[]>(
    initialData?.attributes
      ? Object.entries(initialData.attributes).map(([key, value]) => ({ key, value: String(value) }))
      : []
  )
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  useEffect(() => {
    if (!slugManuallyEdited && name) {
      setSlug(generateSlug(name))
    }
  }, [name, slugManuallyEdited])

  const addAttribute = () => {
    setAttributes([...attributes, { key: '', value: '' }])
  }

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  const updateAttribute = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...attributes]
    updated[index][field] = val
    setAttributes(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const attrObj: Record<string, string> = {}
    attributes.forEach((a) => {
      if (a.key.trim()) {
        attrObj[a.key.trim()] = a.value
      }
    })

    await onSubmit({
      name,
      slug,
      description,
      shortDesc: shortDesc || undefined,
      category,
      brand,
      model: model || undefined,
      priceCents: Math.round(parseFloat(priceDisplay || '0') * 100),
      comparePriceCents: comparePriceDisplay
        ? Math.round(parseFloat(comparePriceDisplay) * 100)
        : undefined,
      costCents: costDisplay
        ? Math.round(parseFloat(costDisplay) * 100)
        : undefined,
      stock: parseInt(stock || '0'),
      sku: sku || undefined,
      isActive,
      isFeatured,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      attributes: Object.keys(attrObj).length > 0 ? attrObj : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <GlassCard intensity="medium">
        <h3 className="text-lg font-semibold mb-4">Informacion basica</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugManuallyEdited(true)
              }}
              className="glass-input w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Descripcion *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input w-full"
              rows={4}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Descripcion corta</label>
            <input
              type="text"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="glass-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categoria *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="glass-input w-full"
              required
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Marca *</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="glass-input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Modelo</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="glass-input w-full"
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard intensity="medium">
        <h3 className="text-lg font-semibold mb-4">Precios e inventario</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Precio (S/) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={priceDisplay}
              onChange={(e) => setPriceDisplay(e.target.value)}
              className="glass-input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Precio anterior (S/)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={comparePriceDisplay}
              onChange={(e) => setComparePriceDisplay(e.target.value)}
              className="glass-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Costo (S/)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={costDisplay}
              onChange={(e) => setCostDisplay(e.target.value)}
              className="glass-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock *</label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="glass-input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="glass-input w-full"
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard intensity="medium">
        <h3 className="text-lg font-semibold mb-4">Atributos del producto</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Especificaciones tecnicas (peso, patron de cuerdas, tamano de grip, etc.)
        </p>
        <div className="space-y-2">
          {attributes.map((attr, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Clave (ej: peso)"
                value={attr.key}
                onChange={(e) => updateAttribute(idx, 'key', e.target.value)}
                className="glass-input flex-1"
              />
              <input
                type="text"
                placeholder="Valor (ej: 300g)"
                value={attr.value}
                onChange={(e) => updateAttribute(idx, 'value', e.target.value)}
                className="glass-input flex-1"
              />
              <button
                type="button"
                onClick={() => removeAttribute(idx)}
                className="p-2 text-destructive hover:bg-destructive/10 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <GlassButton type="button" variant="ghost" size="sm" onClick={addAttribute}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar atributo
          </GlassButton>
        </div>
      </GlassCard>

      <GlassCard intensity="medium">
        <h3 className="text-lg font-semibold mb-4">Estado y SEO</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Activo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Destacado</span>
            </label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Meta titulo</label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="glass-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Meta descripcion</label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="glass-input w-full"
              rows={2}
            />
          </div>
        </div>
      </GlassCard>

      <div className="flex justify-end">
        <GlassButton type="submit" variant="solid" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar producto
            </>
          )}
        </GlassButton>
      </div>
    </form>
  )
}
