'use client'

interface SchedulePickerProps {
  date: string
  onDateChange: (value: string) => void
}

export function SchedulePicker({ date, onDateChange }: SchedulePickerProps) {
  // Minimum date is tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        Fecha preferida de recojo
      </label>
      <input
        type="date"
        className="glass-input w-full"
        min={minDate}
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
      />
      <p className="text-xs text-muted-foreground mt-1">
        Coordinamos el horario exacto por telefono
      </p>
    </div>
  )
}
