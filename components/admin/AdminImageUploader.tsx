'use client'

import { useState } from 'react'
import { GlassButton } from '@/components/ui/glass-button'
import { Plus, X } from 'lucide-react'
import Image from 'next/image'

interface AdminImageUploaderProps {
  images: string[]
  onAdd: (url: string) => void
  onRemove: (url: string) => void
}

export default function AdminImageUploader({ images, onAdd, onRemove }: AdminImageUploaderProps) {
  const [newUrl, setNewUrl] = useState('')

  const handleAdd = () => {
    if (newUrl.trim()) {
      onAdd(newUrl.trim())
      setNewUrl('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Imagenes del producto</h4>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-glass">
              <Image
                src={url}
                alt={`Imagen ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(url)}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No hay imagenes agregadas</p>
      )}

      <div className="flex gap-2">
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="URL de la imagen"
          className="glass-input flex-1"
        />
        <GlassButton
          type="button"
          variant="primary"
          size="sm"
          onClick={handleAdd}
          disabled={!newUrl.trim()}
        >
          <Plus className="h-4 w-4 mr-1" />
          Agregar
        </GlassButton>
      </div>
    </div>
  )
}
