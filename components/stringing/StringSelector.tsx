'use client'

interface StringSelectorProps {
  stringName: string
  onStringNameChange: (value: string) => void
  stringProductId?: string
  onStringProductIdChange?: (value: string) => void
}

export function StringSelector({
  stringName,
  onStringNameChange,
}: StringSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        Nombre de la Cuerda *
      </label>
      <input
        type="text"
        className="glass-input w-full"
        placeholder="Ej: Yonex Poly Tour Pro 125, Luxilon ALU Power 125"
        value={stringName}
        onChange={(e) => onStringNameChange(e.target.value)}
      />
      <p className="text-xs text-muted-foreground mt-1">
        Ingresa el nombre y calibre de la cuerda que deseas
      </p>
    </div>
  )
}
