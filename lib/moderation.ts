export const BANNED_WORDS: string[] = [
  'mierda',
  'puta',
  'puto',
  'pendejo',
  'pendeja',
  'cabron',
  'cabrona',
  'chingar',
  'chingada',
  'chingado',
  'verga',
  'culero',
  'culera',
  'marica',
  'maricon',
  'joto',
  'jota',
  'huevon',
  'huevona',
  'cojudo',
  'cojuda',
  'conchatumadre',
  'concha',
  'imbecil',
  'estupido',
  'estupida',
  'idiota',
  'tarado',
  'tarada',
  'baboso',
  'babosa',
  'malparido',
  'malparida',
  'hijueputa',
  'gonorrea',
  'carepicha',
  'webon',
  'webona',
  'chucha',
  'carajo',
]

export function containsBannedWords(text: string): boolean {
  const lower = text.toLowerCase()
  return BANNED_WORDS.some((word) => lower.includes(word))
}

export function sanitizeText(text: string): string {
  let result = text
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(word, 'gi')
    result = result.replace(regex, '*'.repeat(word.length))
  }
  return result
}
