'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface MediaItem {
  id: string
  type: string
  url: string
  filename: string
  angle: string | null
}

interface MediaLightboxProps {
  items: MediaItem[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export function MediaLightbox({ items, currentIndex, onClose, onNavigate }: MediaLightboxProps) {
  const item = items[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < items.length - 1
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    const threshold = 50
    if (diff > threshold && hasNext) onNavigate(currentIndex + 1)
    if (diff < -threshold && hasPrev) onNavigate(currentIndex - 1)
    setTouchStart(null)
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft' && hasPrev) onNavigate(currentIndex - 1)
    if (e.key === 'ArrowRight' && hasNext) onNavigate(currentIndex + 1)
  }, [onClose, onNavigate, currentIndex, hasPrev, hasNext])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navigation arrows */}
      {hasPrev && (
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Media content */}
      <div
        className="relative max-w-4xl max-h-[85vh] w-full mx-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {item.type === 'VIDEO' ? (
          <video
            src={item.url}
            controls
            autoPlay
            muted
            playsInline
            className="w-full max-h-[85vh] rounded-xl bg-black"
          />
        ) : (
          <div className="relative w-full aspect-video">
            <Image
              src={item.url}
              alt={item.filename}
              fill
              className="object-contain rounded-xl"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        )}

        {/* Info bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl flex items-center justify-between">
          <span className="text-white/80 text-sm truncate">{item.filename}</span>
          <div className="flex items-center gap-2">
            {item.angle && (
              <span className="text-white/70 text-xs px-2 py-0.5 rounded bg-white/10">{item.angle}</span>
            )}
            <span className="text-white/50 text-xs">{currentIndex + 1}/{items.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
