export interface District {
  name: string
  active: boolean
}

export const LIMA_DISTRICTS: District[] = [
  { name: 'Miraflores', active: true },
  { name: 'San Isidro', active: true },
  { name: 'Surco', active: true },
  { name: 'La Molina', active: true },
  { name: 'San Borja', active: true },
  { name: 'Barranco', active: true },
  { name: 'Magdalena', active: true },
  { name: 'Jesus Maria', active: true },
  { name: 'Lince', active: true },
  { name: 'Pueblo Libre', active: true },
  { name: 'San Miguel', active: true },
  { name: 'Surquillo', active: true },
  { name: 'Chorrillos', active: true },
  { name: 'Ate', active: true },
  { name: 'Santa Anita', active: true },
  { name: 'La Victoria', active: true },
  { name: 'Breña', active: true },
  { name: 'Rimac', active: true },
  { name: 'San Juan de Lurigancho', active: true },
  { name: 'San Juan de Miraflores', active: true },
  { name: 'Villa El Salvador', active: true },
  { name: 'Villa Maria del Triunfo', active: true },
  { name: 'Comas', active: true },
  { name: 'Los Olivos', active: true },
  { name: 'Independencia', active: true },
  { name: 'San Martin de Porres', active: true },
  { name: 'Carabayllo', active: true },
  { name: 'Puente Piedra', active: true },
  { name: 'Lurigancho-Chosica', active: true },
  { name: 'Chaclacayo', active: true },
  { name: 'Cieneguilla', active: true },
  { name: 'Pachacamac', active: true },
  { name: 'Lurin', active: true },
  { name: 'Punta Negra', active: true },
  { name: 'Punta Hermosa', active: true },
  { name: 'San Bartolo', active: true },
  { name: 'Santa Maria del Mar', active: true },
  { name: 'Callao', active: true },
  { name: 'Bellavista', active: true },
  { name: 'La Perla', active: true },
  { name: 'Carmen de la Legua', active: true },
]

export const PROXIMAMENTE_CITIES = ['Arequipa', 'Cusco', 'Trujillo'] as const

export function isDistrictCovered(district: string): boolean {
  return LIMA_DISTRICTS.some(
    (d) => d.name.toLowerCase() === district.toLowerCase() && d.active
  )
}

export function getActiveDistricts(): string[] {
  return LIMA_DISTRICTS.filter((d) => d.active).map((d) => d.name)
}

export function getCoverageInfo() {
  return {
    active: getActiveDistricts(),
    proximamente: [...PROXIMAMENTE_CITIES],
  }
}
