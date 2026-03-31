// ─── Uzbek Transliteration (Cyrillic ↔ Latin) ────────────────────────────────

const cyrToLat: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'ъ': "'", 'э': 'e',
  'ю': 'yu', 'я': 'ya', 'ў': "o'", 'қ': 'q', 'ғ': "g'", 'ҳ': 'h',
}

const latToCyr: Record<string, string> = {
  "o'": 'ў', "g'": 'ғ', "sh": 'ш', "ch": 'ч', "yo": 'ё', "yu": 'ю',
  "ya": 'я', "ts": 'ц', 'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г',
  'd': 'д', 'e': 'е', 'j': 'ж', 'z': 'з', 'i': 'и', 'y': 'й',
  'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п',
  'r': 'р', 's': 'с', 't': 'т', 'u': 'у', 'f': 'ф', 'x': 'х',
  'q': 'қ', 'h': 'ҳ', "'": 'ъ',
}

/**
 * Detect script type of text.
 */
export function detectScript(text: string): 'latin' | 'cyrillic' | 'mixed' | 'other' {
  const cyrCount = (text.match(/[\u0400-\u04FF]/g) ?? []).length
  const latCount = (text.match(/[a-zA-Z]/g) ?? []).length

  if (cyrCount === 0 && latCount === 0) return 'other'
  if (cyrCount > 0 && latCount === 0) return 'cyrillic'
  if (latCount > 0 && cyrCount === 0) return 'latin'
  return 'mixed'
}

/**
 * Convert Uzbek Cyrillic text to Latin.
 */
export function toLatin(text: string): string {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i].toLowerCase()
    const upper = text[i] !== ch

    if (cyrToLat[ch]) {
      const mapped = cyrToLat[ch]
      result += upper ? mapped[0].toUpperCase() + mapped.slice(1) : mapped
    } else {
      result += text[i]
    }
  }
  return result
}

/**
 * Convert Uzbek Latin text to Cyrillic.
 */
export function toCyrillic(text: string): string {
  let result = ''
  let i = 0

  while (i < text.length) {
    let matched = false

    // Try 2-char digraphs first
    if (i + 1 < text.length) {
      const twoChar = text.slice(i, i + 2).toLowerCase()
      if (latToCyr[twoChar]) {
        const upper = text[i] !== text[i].toLowerCase()
        const mapped = latToCyr[twoChar]
        result += upper ? mapped.toUpperCase() : mapped
        i += 2
        matched = true
      }
    }

    if (!matched) {
      const ch = text[i].toLowerCase()
      const upper = text[i] !== ch

      if (latToCyr[ch]) {
        const mapped = latToCyr[ch]
        result += upper ? mapped.toUpperCase() : mapped
      } else {
        result += text[i]
      }
      i++
    }
  }

  return result
}

/**
 * Transliterate text to match the target script.
 */
export function transliterate(text: string, targetScript: 'latin' | 'cyrillic'): string {
  return targetScript === 'latin' ? toLatin(text) : toCyrillic(text)
}
