'use client'

import { useState, useEffect, useCallback } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassBadge } from '@/components/ui/glass-badge'
import { Upload, FileText, Trash2, Play, RefreshCw, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface DocumentItem {
  id: string
  originalName: string
  fileSize: number
  pageCount: number | null
  sportSlug: string | null
  status: 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  errorMessage: string | null
  createdAt: string
  _count: { chunks: number }
  uploadedBy: { name: string | null; email: string }
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'destructive' }> = {
  UPLOADING: { label: 'Subido', variant: 'default' },
  PROCESSING: { label: 'Procesando', variant: 'warning' },
  COMPLETED: { label: 'Completado', variant: 'success' },
  FAILED: { label: 'Error', variant: 'destructive' },
}

export default function AdminPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [sportSlug, setSportSlug] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/documents')
      if (res.ok) {
        setDocuments(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement
    const file = fileInput?.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (sportSlug) formData.append('sportSlug', sportSlug)

      const res = await fetch('/api/admin/documents', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Error al subir documento')
        return
      }

      toast.success('Documento subido correctamente')
      form.reset()
      setSportSlug('')
      await fetchDocuments()
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Error al subir documento')
    } finally {
      setUploading(false)
    }
  }

  const handleProcess = async (id: string) => {
    setProcessingIds((prev) => new Set(prev).add(id))
    try {
      const res = await fetch(`/api/admin/documents/${id}/process`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Error al procesar')
      } else {
        toast.success('Documento procesado correctamente')
      }
      await fetchDocuments()
    } catch (error) {
      console.error('Process failed:', error)
      toast.error('Error al procesar documento')
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null)
    try {
      const res = await fetch(`/api/admin/documents/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Documento eliminado')
        await fetchDocuments()
      } else {
        toast.error('Error al eliminar documento')
      }
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Error al eliminar documento')
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground text-sm">
            Gestiona los PDFs que alimentan el sistema RAG de la IA
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <GlassCard intensity="medium">
        <form onSubmit={handleUpload} className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir PDF
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-1">Archivo PDF</label>
              <input
                type="file"
                accept=".pdf"
                required
                className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium hover:file:bg-primary/20 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Deporte (opcional)</label>
              <select
                value={sportSlug}
                onChange={(e) => setSportSlug(e.target.value)}
                className="w-full h-10 rounded-lg border border-glass bg-background/50 px-3 text-sm"
              >
                <option value="">Todos los deportes</option>
                <option value="tennis">Tenis</option>
              </select>
            </div>
            <div className="flex items-end">
              <GlassButton type="submit" variant="solid" disabled={uploading} className="w-full">
                {uploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir PDF
                  </>
                )}
              </GlassButton>
            </div>
          </div>
        </form>
      </GlassCard>

      {/* Documents List */}
      <GlassCard intensity="light" padding="none">
        <div className="p-4 border-b border-glass flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos ({documents.length})
          </h2>
          <GlassButton variant="ghost" size="sm" onClick={fetchDocuments}>
            <RefreshCw className="h-4 w-4" />
          </GlassButton>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No hay documentos. Sube un PDF para comenzar.
          </div>
        ) : (
          <div className="divide-y divide-glass">
            {documents.map((doc) => {
              const statusConf = STATUS_CONFIG[doc.status]
              const isProcessing = processingIds.has(doc.id) || doc.status === 'PROCESSING'
              return (
                <div key={doc.id} className="p-4 flex items-center gap-4">
                  <FileText className="h-10 w-10 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.originalName}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{formatSize(doc.fileSize)}</span>
                      {doc.pageCount && <span>{doc.pageCount} págs</span>}
                      {doc.sportSlug && <span>{doc.sportSlug}</span>}
                      <span>{doc._count.chunks} chunks</span>
                    </div>
                    {doc.errorMessage && (
                      <p className="text-xs text-destructive mt-1 line-clamp-2">
                        {doc.errorMessage}
                      </p>
                    )}
                  </div>
                  <GlassBadge variant={statusConf.variant}>
                    {statusConf.label}
                  </GlassBadge>
                  <div className="flex items-center gap-2 shrink-0">
                    {(doc.status === 'UPLOADING' || doc.status === 'FAILED') && (
                      <GlassButton
                        variant="primary"
                        size="sm"
                        onClick={() => handleProcess(doc.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </GlassButton>
                    )}
                    <GlassButton
                      variant="destructive"
                      size="sm"
                      onClick={() => setConfirmDeleteId(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </GlassButton>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </GlassCard>

      {/* Delete confirmation dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-card border border-border rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Confirmar eliminacion</h3>
            <p className="text-muted-foreground text-sm mb-6">
              ¿Eliminar este documento y todos sus chunks? Esta accion no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <GlassButton variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                Cancelar
              </GlassButton>
              <GlassButton variant="destructive" onClick={() => handleDelete(confirmDeleteId)}>
                Eliminar
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
