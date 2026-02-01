'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { GlassButton } from '@/components/ui/glass-button'
import { logger } from '@/lib/logger'
import { GlassCard } from '@/components/ui/glass-card'
import { toast } from 'sonner'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Upload,
  X,
  Check,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSport } from '@/contexts/SportContext'
import { VideoGuidelines } from '@/components/upload/VideoGuidelines'
import { VideoRequirements } from '@/components/upload/VideoRequirements'
import { DetectionConfirmation } from '@/components/analyze/DetectionConfirmation'

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

interface DetectionResponse {
  detected: {
    technique: {
      id: string
      slug: string
      name: string
      description: string | null
    }
    variant: {
      id: string
      slug: string
      name: string
    } | null
    confidence: number
    reasoning: string
  } | null
  multipleDetected?: boolean
  alternatives?: Array<{
    technique: { id: string; slug: string; name: string }
    variant: { id: string; slug: string; name: string } | null
    confidence: number
  }>
  warning?: string
  reasoning?: string
}

type Step = 'sport' | 'technique' | 'variant' | 'upload' | 'detecting' | 'detection-confirm' | 'processing'

export default function AnalyzePage() {
  const router = useRouter()
  const { activeSport } = useSport()
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
  const [autoDetectMode, setAutoDetectMode] = useState(false)
  const [detectionResult, setDetectionResult] = useState<DetectionResponse | null>(null)
  const [uploadProgress, setUploadProgress] = useState('')
  const [processingStage, setProcessingStage] = useState(0)
  const [uploadedMediaItems, setUploadedMediaItems] = useState<
    Array<{ url: string; type: string; filename: string; size: number }>
  >([])
  const [isDragging, setIsDragging] = useState(false)
  const [processingElapsed, setProcessingElapsed] = useState(0)
  const [analysisComplete, setAnalysisComplete] = useState<string | null>(null)
  const processingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [initialStepApplied, setInitialStepApplied] = useState(false)
  const [currentUploadingFile, setCurrentUploadingFile] = useState<string>('')

  // Fetch sports on mount and pre-select active sport
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/sports', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        const activeSports = data.filter((s: Sport) => s.isActive)
        setSports(activeSports)
        // Pre-select from sport context
        if (activeSport && !selectedSport) {
          const match = activeSports.find((s: Sport) => s.slug === activeSport.slug)
          if (match) setSelectedSport(match)
        }
        setLoadingSports(false)
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return
        toast.error('Error al cargar deportes')
        setLoadingSports(false)
      })
    return () => controller.abort()
  }, [activeSport])

  // Skip sport step when pre-selected from context
  useEffect(() => {
    if (!initialStepApplied && selectedSport && activeSport && step === 'sport' && !loadingSports) {
      setStep('technique')
      setInitialStepApplied(true)
    }
  }, [selectedSport, activeSport, step, loadingSports, initialStepApplied])

  // Fetch techniques when sport is selected
  useEffect(() => {
    if (!selectedSport) return
    const controller = new AbortController()
    setLoadingTechniques(true)
    fetch(`/api/sports/${selectedSport.id}/techniques`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        setTechniques(data.techniques || [])
        setVariants([])
        setLoadingTechniques(false)
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return
        toast.error('Error al cargar tecnicas')
        setLoadingTechniques(false)
      })
    return () => controller.abort()
  }, [selectedSport])

  // Set variants when technique is selected
  useEffect(() => {
    if (!selectedTechnique) return
    const controller = new AbortController()
    fetch(`/api/sports/${selectedSport?.id}/techniques/${selectedTechnique.id}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        setVariants(data.variants || [])
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return
        setVariants([])
      })
    return () => controller.abort()
  }, [selectedTechnique, selectedSport])

  // Route guard during uploading/processing
  useEffect(() => {
    if (!processing && !uploading) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [processing, uploading])

  // Processing timer
  useEffect(() => {
    if (processing) {
      setProcessingElapsed(0)
      processingTimerRef.current = setInterval(() => {
        setProcessingElapsed((prev) => prev + 1)
      }, 1000)
    } else {
      if (processingTimerRef.current) {
        clearInterval(processingTimerRef.current)
        processingTimerRef.current = null
      }
      setProcessingElapsed(0)
    }
    return () => {
      if (processingTimerRef.current) {
        clearInterval(processingTimerRef.current)
      }
    }
  }, [processing])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    addFiles(selectedFiles)
  }, [])

  const addFiles = (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter((file) => {
      const isVideo = file.type.startsWith('video/')
      const isImage = file.type.startsWith('image/')
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024 // 100MB video, 10MB image

      if (!isVideo && !isImage) {
        toast.error(`${file.name}: formato no soportado. Usa MP4, MOV, WebM, JPG o PNG`)
        return false
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} excede el limite (${isVideo ? '100MB' : '10MB'}). Tamaño: ${(file.size / 1024 / 1024).toFixed(1)}MB`)
        return false
      }
      return true
    })

    setFiles((prev) => [...prev, ...validFiles].slice(0, 5))
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }, [])

  async function uploadFiles(): Promise<
    Array<{ url: string; type: string; filename: string; size: number }>
  > {
    const mediaItems: Array<{
      url: string
      type: string
      filename: string
      size: number
    }> = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setCurrentUploadingFile(file.name)
      setUploadProgress(files.length > 1 ? `Subiendo ${i + 1} de ${files.length} — ${file.name}` : 'Subiendo...')

      const isVideo = file.type.startsWith('video/')

      // Generate unique filename
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 8)
      const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
      const uniqueName = `analyses/${timestamp}-${random}.${ext}`

      try {
        // Use client-side upload directly to Vercel Blob (bypasses server size limit)
        const { upload } = await import('@vercel/blob/client')
        const blob = await upload(uniqueName, file, {
          access: 'public',
          handleUploadUrl: '/api/upload/token',
        })

        mediaItems.push({
          url: blob.url,
          type: isVideo ? 'VIDEO' : 'IMAGE',
          filename: file.name,
          size: file.size,
        })
      } catch (error) {
        logger.error(`Upload failed for ${file.name}:`, error)
        throw new Error(`Error al subir ${file.name}. Verifica tu conexion e intenta de nuevo.`)
      }
    }

    setUploadProgress('')
    setCurrentUploadingFile('')
    return mediaItems
  }

  async function handleAutoDetect() {
    if (!selectedSport || files.length === 0) return

    setUploading(true)
    try {
      // Upload files first
      const mediaItems = await uploadFiles()
      setUploadedMediaItems(mediaItems)
      setUploading(false)

      // Run detection
      setStep('detecting')
      const detectionForm = new FormData()
      detectionForm.append('sportId', selectedSport.id)
      detectionForm.append(
        'fileUrls',
        JSON.stringify(
          mediaItems.map((m) => ({
            url: m.url,
            type: m.type,
            filename: m.filename,
          }))
        )
      )

      const detRes = await fetch('/api/analyze/detect-technique', {
        method: 'POST',
        body: detectionForm,
      })

      if (!detRes.ok) {
        const errBody = await detRes.json().catch(() => null)
        const msg = errBody?.error || `Error ${detRes.status}`
        logger.error('detect-technique failed:', detRes.status, msg)
        throw new Error(msg)
      }

      const detection: DetectionResponse = await detRes.json()
      setDetectionResult(detection)

      if (!detection.detected) {
        toast.error(detection.warning || 'No se pudo detectar la tecnica')
        setAutoDetectMode(false)
        setStep('technique')
        return
      }

      setStep('detection-confirm')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al detectar la tecnica'
      toast.error(msg)
      setUploading(false)
      setAutoDetectMode(false)
      setStep('technique')
    }
  }

  async function handleDetectionConfirm(techniqueId: string, variantId: string | null) {
    setProcessing(true)
    setProcessingStage(1)
    setStep('processing')

    try {
      // Create analysis with detected technique
      const analysisRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          techniqueId,
          variantId,
          mediaItems: uploadedMediaItems,
        }),
      })

      if (!analysisRes.ok) {
        throw new Error('Error al crear analisis')
      }

      const analysis = await analysisRes.json()

      const processRes = await fetch(`/api/analyze/${analysis.id}/process`, {
        method: 'POST',
      })

      if (!processRes.ok) {
        throw new Error('Error al procesar analisis')
      }

      setProcessingStage(2)
      setAnalysisComplete(analysis.id)
    } catch (error) {
      toast.error('Error al procesar el analisis')
      setProcessing(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedSport || !selectedTechnique || files.length === 0) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setUploading(true)

    try {
      const mediaItems = await uploadFiles()

      // Create analysis record
      const analysisRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          techniqueId: selectedTechnique.id,
          variantId: selectedVariant?.id,
          mediaItems,
        }),
      })

      if (!analysisRes.ok) {
        throw new Error('Error al crear analisis')
      }

      const analysis = await analysisRes.json()

      setUploading(false)
      setProcessing(true)
      setProcessingStage(1)
      setStep('processing')

      // Start AI processing
      const processRes = await fetch(`/api/analyze/${analysis.id}/process`, {
        method: 'POST',
      })

      if (!processRes.ok) {
        throw new Error('Error al procesar analisis')
      }

      setProcessingStage(2)
      setAnalysisComplete(analysis.id)
    } catch (error) {
      toast.error('Error al procesar el analisis')
      setUploading(false)
      setProcessing(false)
    }
  }

  const steps = autoDetectMode
    ? [
        { id: 'sport', label: 'Deporte' },
        { id: 'upload', label: 'Video' },
        { id: 'detection-confirm', label: 'Deteccion' },
      ]
    : [
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
        return true
      case 'upload':
        return files.length > 0
      default:
        return false
    }
  }

  const goNext = () => {
    switch (step) {
      case 'sport':
        if (autoDetectMode) {
          setStep('upload')
        } else {
          setStep('technique')
        }
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
        if (autoDetectMode) {
          handleAutoDetect()
        } else {
          handleSubmit()
        }
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
        if (autoDetectMode) {
          setStep('technique')
        } else if (variants.length > 0) {
          setStep('variant')
        } else {
          setStep('technique')
        }
        break
      case 'detection-confirm':
        setStep('upload')
        break
    }
  }

  const navigateToStep = (targetStepId: string) => {
    const targetIndex = steps.findIndex((s) => s.id === targetStepId)
    if (targetIndex < currentStepIndex) {
      setStep(targetStepId as Step)
    }
  }

  if (processing) {
    const stages = [
      { icon: Upload, label: 'Subiendo video', activeLabel: 'Subiendo video...' },
      { icon: Sparkles, label: 'Analizando tecnica', activeLabel: 'Analizando tecnica...' },
      { icon: Check, label: 'Generando resultados', activeLabel: 'Generando resultados...' },
    ]

    return (
      <div className="max-w-2xl mx-auto py-12">
        <GlassCard intensity="medium" padding="xl">
          <div className="space-y-6">
            {stages.map((stage, i) => {
              const isCompleted = i < processingStage
              const isActive = i === processingStage
              const isPending = i > processingStage

              return (
                <div key={i} className="flex items-center gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500',
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-primary text-primary-foreground shadow-glass-glow' :
                    'glass-ultralight border-glass text-muted-foreground'
                  )}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : isActive ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <stage.icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      'font-medium transition-colors',
                      isCompleted ? 'text-green-600' :
                      isActive ? 'text-foreground' :
                      'text-muted-foreground'
                    )}>
                      {isActive ? stage.activeLabel : stage.label}
                    </p>
                  </div>
                  {isCompleted && (
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
          {analysisComplete ? (
            <div className="text-center space-y-4 mt-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-lg font-semibold">Analisis completado!</p>
              <GlassButton variant="solid" onClick={() => router.push(`/analyses/${analysisComplete}`)}>
                Ver resultados
                <ArrowRight className="ml-2 h-4 w-4" />
              </GlassButton>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center mt-6">
                {processingElapsed > 30
                  ? 'Tomando mas tiempo de lo esperado, por favor espera...'
                  : 'Esto puede tomar unos segundos...'}
              </p>
              <p className="text-xs text-muted-foreground/60 text-center mt-2 tabular-nums">
                {processingElapsed}s
              </p>
            </>
          )}
        </GlassCard>
      </div>
    )
  }

  if (step === 'detecting') {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <GlassCard intensity="medium" padding="xl" className="space-y-4">
          <Sparkles className="h-12 w-12 mx-auto text-primary animate-pulse" />
          <h2 className="text-xl font-semibold">Detectando tecnica...</h2>
          <p className="text-muted-foreground">
            Nuestra IA esta analizando tu video para identificar la tecnica
          </p>
        </GlassCard>
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
              {i < currentStepIndex ? (
                <button
                  onClick={() => navigateToStep(s.id)}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-[var(--duration-normal)] cursor-pointer',
                    'bg-primary text-primary-foreground shadow-glass-glow hover:opacity-80'
                  )}
                >
                  <Check className="h-4 w-4" />
                </button>
              ) : (
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-[var(--duration-normal)]',
                    i <= currentStepIndex
                      ? 'bg-primary text-primary-foreground shadow-glass-glow'
                      : 'glass-ultralight border-glass text-muted-foreground'
                  )}
                >
                  {i + 1}
                </div>
              )}
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'h-1 flex-1 mx-2 rounded-full transition-all duration-[var(--duration-normal)]',
                    i < currentStepIndex ? 'bg-primary' : 'glass-ultralight'
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
                'text-center transition-colors duration-[var(--duration-normal)]',
                s.id === step ? 'text-primary font-medium' : 'text-muted-foreground'
              )}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <GlassCard intensity="medium" padding="lg">
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
            ) : sports.length === 0 ? (
              <div className="flex justify-center py-12">
                <p className="text-muted-foreground">No hay deportes disponibles</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {sports.map((sport) => (
                  <button
                    key={sport.id}
                    onClick={() => setSelectedSport(sport)}
                    className={cn(
                      'p-4 rounded-xl text-left transition-all duration-[var(--duration-normal)]',
                      selectedSport?.id === sport.id
                        ? 'glass-primary border-glass shadow-glass-glow'
                        : 'glass-ultralight border-glass hover:glass-light'
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg glass-light border-glass flex items-center justify-center mb-2">
                      <Trophy className="h-5 w-5 text-muted-foreground" />
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
                {/* Auto-detect option as first card */}
                <button
                  onClick={() => {
                    setAutoDetectMode(true)
                    setSelectedTechnique(null)
                    setStep('upload')
                  }}
                  className={cn(
                    'p-4 rounded-xl text-left transition-all duration-[var(--duration-normal)]',
                    'glass-ultralight border-glass hover:glass-light',
                    'relative overflow-hidden'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg glass-primary border-glass flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Detectar automaticamente</h3>
                      <p className="text-sm text-muted-foreground">
                        La IA identifica la tecnica desde tu video
                      </p>
                    </div>
                  </div>
                </button>

                {techniques.length === 0 && !loadingTechniques && (
                  <p className="text-muted-foreground text-center py-4">
                    No hay tecnicas disponibles para este deporte. Usa la deteccion automatica.
                  </p>
                )}

                {techniques.map((technique) => (
                  <button
                    key={technique.id}
                    onClick={() => {
                      setAutoDetectMode(false)
                      setSelectedTechnique(technique)
                    }}
                    className={cn(
                      'p-4 rounded-xl text-left transition-all duration-[var(--duration-normal)]',
                      selectedTechnique?.id === technique.id
                        ? 'glass-primary border-glass shadow-glass-glow'
                        : 'glass-ultralight border-glass hover:glass-light'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{technique.name}</h3>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground mr-1">Dificultad</span>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              'w-2 h-2 rounded-full transition-colors',
                              i < technique.difficulty
                                ? 'bg-primary'
                                : 'glass-ultralight border-glass'
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
                  'p-4 rounded-xl text-left transition-all duration-[var(--duration-normal)]',
                  selectedVariant === null
                    ? 'glass-primary border-glass shadow-glass-glow'
                    : 'glass-ultralight border-glass hover:glass-light'
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
                    'p-4 rounded-xl text-left transition-all duration-[var(--duration-normal)]',
                    selectedVariant?.id === variant.id
                      ? 'glass-primary border-glass shadow-glass-glow'
                      : 'glass-ultralight border-glass hover:glass-light'
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
              {autoDetectMode
                ? 'Sube tu video y la IA detectara automaticamente la tecnica'
                : `Graba tu ${selectedTechnique?.name.toLowerCase()} desde diferentes angulos para un mejor analisis`}
            </p>

            <VideoRequirements />
            <VideoGuidelines />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'border-2 border-dashed rounded-xl p-4 sm:p-8 text-center transition-all duration-[var(--duration-normal)] mt-4',
                isDragging
                  ? 'border-primary bg-primary/5 scale-[1.03]'
                  : 'border-glass hover:border-primary/50 hover:glass-ultralight'
              )}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".mp4,.mov,.webm,.avi,.jpg,.jpeg,.png,.heic"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="glass-light border-glass rounded-2xl p-4 w-fit mx-auto mb-4">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium mb-1">
                  Arrastra archivos o haz clic para seleccionar
                </p>
                <p className="text-sm text-muted-foreground">
                  Videos (max 100MB) o imagenes (max 10MB) — Hasta 5 archivos
                </p>
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center justify-between p-3 glass-ultralight border-glass rounded-xl',
                      uploading && currentUploadingFile === file.name && 'ring-1 ring-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                        {file.type.startsWith('video/') ? (
                          <video
                            src={URL.createObjectURL(file) + '#t=0.5'}
                            className="w-full h-full object-cover"
                            preload="metadata"
                            muted
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={URL.createObjectURL(file)}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                          {uploading && currentUploadingFile === file.name && (
                            <span className="ml-2 text-primary">Subiendo...</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1.5 hover:glass-light rounded-lg transition-colors"
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'detection-confirm' && detectionResult?.detected && (
          <DetectionConfirmation
            detected={detectionResult.detected}
            multipleDetected={detectionResult.multipleDetected || false}
            alternatives={detectionResult.alternatives || []}
            onConfirm={handleDetectionConfirm}
            onManualSelect={() => {
              setAutoDetectMode(false)
              setStep('technique')
            }}
          />
        )}

        {/* Navigation (hidden during detection-confirm — it has its own buttons) */}
        {step !== 'detection-confirm' && (
          <div className="flex justify-between mt-8 pt-6 border-t border-glass">
            <GlassButton
              variant="outline"
              onClick={goBack}
              disabled={step === 'sport' || uploading}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Atras
            </GlassButton>

            <GlassButton variant="solid" onClick={goNext} disabled={!canGoNext() || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadProgress || 'Subiendo...'}
                </>
              ) : step === 'upload' ? (
                autoDetectMode ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Detectar y analizar
                  </>
                ) : (
                  'Analizar'
                )
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </GlassButton>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
