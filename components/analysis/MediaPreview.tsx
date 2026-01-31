'use client'

import { useState } from 'react'
import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { MediaLightbox } from './MediaLightbox'

interface MediaItem {
  id: string
  type: string
  url: string
  filename: string
  angle: string | null
  thumbnailUrl: string | null
}

interface MediaPreviewProps {
  items: MediaItem[]
}

export function MediaPreview({ items }: MediaPreviewProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (items.length === 0) return null

  return (
    <>
      <GlassCard intensity="light" padding="lg">
        <h2 className="font-semibold mb-3">Archivos analizados</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setLightboxIndex(index)}
              className="aspect-video glass-ultralight border-glass rounded-lg overflow-hidden relative group cursor-pointer"
            >
              {item.type === 'VIDEO' ? (
                <video
                  src={item.url + '#t=0.5'}
                  preload="metadata"
                  playsInline
                  muted
                  className="w-full h-full object-cover bg-black"
                />
              ) : (
                <Image
                  src={item.url}
                  alt={item.filename}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                  Ver
                </span>
              </div>
              {item.angle && (
                <span className="absolute bottom-1 right-1 glass-medium text-white text-xs px-2 py-0.5 rounded">
                  {item.angle}
                </span>
              )}
            </button>
          ))}
        </div>
      </GlassCard>

      {lightboxIndex !== null && (
        <MediaLightbox
          items={items}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  )
}
