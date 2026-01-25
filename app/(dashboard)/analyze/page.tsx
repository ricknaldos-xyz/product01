'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Upload,
  X,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Sport {
  id: string
  slug: string
  name: string
  icon: string
  isActive: boolean
}

interface Technique {
  id: string
  slug: string
  name: string
  description: string | null
  difficulty: number
}

interface Variant {
  id: string
  slug: string
  name: string
  description: string | null
}

type Step = 'sport' | 'technique' | 'variant' | 'upload' | 'processing'

export default function AnalyzePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('sport')
  const [sports, setSports] = useState<Sport[]>([])
  const [techniques, setTechniques] = useState<Technique[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null)
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [loadingSports, setLoadingSports] = useState(true)
  const [loadingTechniques, setLoadingTechniques] = useState(false)

  // Fetch sports on mount
  useEffect(() => {
    fetch('/api/sports')
      .then((res) => res.json())
      .then((data) => {
        setSports(data.filter((s: Sport) => s.isActive))
        setLoadingSports(false)
      })
      .catch(() => {
        toast.error('Error al cargar deportes')
        setLoadingSports(false)
      })
  }, [])

  // Fetch techniques when sport is selected
  useEffect(() => {
    if (selectedSport) {
      setLoadingTechniques(true)
      fetch(`/api/sports/${selectedSport.id}/techniques`)
        .then((res) => res.json())
        .then((data) => {
          setTechniques(data.techniques || [])
          setVariants([])
          setLoadingTechniques(false)
        })
        .catch(() => {
          toast.error('Error al cargar tecnicas')
          setLoadingTechniques(false)
        })
    }
  }, [selectedSport])

  // Set variants when technique is selected
  useEffect(() => {
    if (selectedTechnique) {
      fetch(`/api/sports/${selectedSport?.id}/techniques/${selectedTechnique.id}`)
        .then((res) => res.json())
        .then((data) => {
          setVariants(data.variants || [])
        })
        .catch(() => {
          setVariants([])
        })
    }
  }, [selectedTechnique, selectedSport])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const validFiles = selectedFiles.filter((file) => {
      const isVideo = file.type.startsWith('video/')
      const isImage = file.type.startsWith('image/')
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024 // 100MB video, 10MB image

      if (!isVideo && !isImage) {
        toast.error(`${file.name} no es un formato valido`)
        return false
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} es muy grande`)
        return false
      }
      return true
    })

    setFiles((prev) => [...prev, ...validFiles].slice(0, 5))
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!selectedSport || !selectedTechnique || files.length === 0) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setUploading(true)

    try {
      // Upload files
      const uploadedUrls: { url: string; type: string; filename: string; size: number }[] = []

      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error('Error al subir archivo')
        }

        const uploadData = await uploadRes.json()
        uploadedUrls.push({
          url: uploadData.url,
          type: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
          filename: file.name,
          size: file.size,
        })
      }

      // Create analysis
      const analysisRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          techniqueId: selectedTechnique.id,
          variantId: selectedVariant?.id,
          mediaItems: uploadedUrls,
        }),
      })

      if (!analysisRes.ok) {
        throw new Error('Error al crear analisis')
      }

      const analysis = await analysisRes.json()

      setUploading(false)
      setProcessing(true)
      setStep('processing')

      // Start processing
      const processRes = await fetch(`/api/analyze/${analysis.id}/process`, {
        method: 'POST',
      })

      if (!processRes.ok) {
        throw new Error('Error al procesar analisis')
      }

      toast.success('Analisis completado!')
      router.push(`/analyses/${analysis.id}`)
    } catch (error) {
      toast.error('Error al procesar el analisis')
      setUploading(false)
      setProcessing(false)
    }
  }

  const steps = [
    { id: 'sport', label: 'Deporte' },
    { id: 'technique', label: 'Tecnica' },
    { id: 'variant', label: 'Variante' },
    { id: 'upload', label: 'Video' },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === step)

  const canGoNext = () => {
    switch (step) {
      case 'sport':
        return !!selectedSport
      case 'technique':
        return !!selectedTechnique
      case 'variant':
        return true // Variant is optional
      case 'upload':
        return files.length > 0
      default:
        return false
    }
  }

  const goNext = () => {
    switch (step) {
      case 'sport':
        setStep('technique')
        break
      case 'technique':
        if (variants.length > 0) {
          setStep('variant')
        } else {
          setStep('upload')
        }
        break
      case 'variant':
        setStep('upload')
        break
      case 'upload':
        handleSubmit()
        break
    }
  }

  const goBack = () => {
    switch (step) {
      case 'technique':
        setStep('sport')
        break
      case 'variant':
        setStep('technique')
        break
      case 'upload':
        if (variants.length > 0) {
          setStep('variant')
        } else {
          setStep('technique')
        }
        break
    }
  }

  if (processing) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold mb-2">Analizando tu tecnica...</h2>
        <p className="text-muted-foreground">
          Nuestra IA esta revisando tu video. Esto puede tomar unos segundos.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'flex items-center',
                i < steps.length - 1 && 'flex-1'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  i <= currentStepIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {i < currentStepIndex ? (
                  <Check className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'h-1 flex-1 mx-2',
                    i < currentStepIndex ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm">
          {steps.map((s) => (
            <span
              key={s.id}
              className={cn(
                'text-center',
                s.id === step ? 'text-primary font-medium' : 'text-muted-foreground'
              )}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-xl p-6">
        {step === 'sport' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Selecciona el deporte</h2>
            <p className="text-muted-foreground mb-6">
              Elige el deporte que quieres analizar
            </p>

            {loadingSports ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {sports.map((sport) => (
                  <button
                    key={sport.id}
                    onClick={() => setSelectedSport(sport)}
                    className={cn(
                      'p-4 rounded-lg border-2 text-left transition-colors',
                      selectedSport?.id === sport.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="text-3xl mb-2">
                      {sport.slug === 'tennis' ? '🎾' : '🏅'}
                    </div>
                    <h3 className="font-medium">{sport.name}</h3>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'technique' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Selecciona la tecnica</h2>
            <p className="text-muted-foreground mb-6">
              Que tecnica quieres mejorar?
            </p>

            {loadingTechniques ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-3">
                {techniques.map((technique) => (
                  <button
                    key={technique.id}
                    onClick={() => setSelectedTechnique(technique)}
                    className={cn(
                      'p-4 rounded-lg border-2 text-left transition-colors',
                      selectedTechnique?.id === technique.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{technique.name}</h3>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              'w-2 h-2 rounded-full',
                              i < technique.difficulty
                                ? 'bg-primary'
                                : 'bg-muted'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    {technique.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {technique.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'variant' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Selecciona la variante (opcional)
            </h2>
            <p className="text-muted-foreground mb-6">
              Que tipo especifico de {selectedTechnique?.name.toLowerCase()} quieres
              analizar?
            </p>

            <div className="grid gap-3">
              <button
                onClick={() => setSelectedVariant(null)}
                className={cn(
                  'p-4 rounded-lg border-2 text-left transition-colors',
                  selectedVariant === null
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <h3 className="font-medium">General</h3>
                <p className="text-sm text-muted-foreground">
                  Analizar la tecnica en general
                </p>
              </button>

              {variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={cn(
                    'p-4 rounded-lg border-2 text-left transition-colors',
                    selectedVariant?.id === variant.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <h3 className="font-medium">{variant.name}</h3>
                  {variant.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {variant.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'upload' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Sube tu video o fotos</h2>
            <p className="text-muted-foreground mb-6">
              Graba tu {selectedTechnique?.name.toLowerCase()} desde diferentes angulos
              para un mejor analisis
            </p>

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="video/*,image/*"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium mb-1">
                  Arrastra archivos o haz clic para seleccionar
                </p>
                <p className="text-sm text-muted-foreground">
                  Videos (max 100MB) o imagenes (max 10MB)
                </p>
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        {file.type.startsWith('video/') ? '🎬' : '📷'}
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-background rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={step === 'sport' || uploading}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Atras
          </Button>

          <Button onClick={goNext} disabled={!canGoNext() || uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : step === 'upload' ? (
              'Analizar'
            ) : (
              <>
                Siguiente
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
