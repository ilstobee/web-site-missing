// Простая цензура для чата, отзывов и заявок.
// Заменяет грубые/нецензурные выражения звёздочками.

// Основа слов (нормализованы: буква «ё» записана как «е» — вторая вариант
// перекрывается в регулярных выражениях через [её]).
const WORD_STEMS = [
  'хуй', 'хуя', 'хуе', 'хуи', 'хую', 'хуиня',
  'пизд',
  'бля', 'бляд',
  'еба', 'ебу', 'ебло', 'ебан', 'ебаш',
  'сука', 'суки', 'сучк', 'сучар',
  'гандон', 'мудак', 'мудац',
  'говно', 'говен',
  'дерьм',
  'шлюх',
  'мраз',
  'твар',
  'пидор', 'пидарас', 'пидр',
  'залуп',
  'дебил', 'идиот',
  'урод',
  'ублюд',
  'даун',
  'долбо',
  'жопа', 'жоп',
  'срать', 'ссать', 'засс',
  'дурак', 'дуроч', 'дура',
  'кретин',
  'придурок',
  'сволоч',
  'падла',
  'козел',
  'кончен',
]

const MIN_STEM_LENGTH = 3

function toPattern(stem: string): string {
  const escaped = stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return escaped.replace(/е/g, '[её]')
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/ё/g, 'е')
}

export function hasProfanity(value: string): boolean {
  const text = normalize(value)
  return WORD_STEMS.some((stem) => stem.length >= MIN_STEM_LENGTH && text.includes(stem))
}

export function censor(value: string): string {
  let out = value
  for (const stem of WORD_STEMS) {
    if (stem.length < MIN_STEM_LENGTH) continue
    const re = new RegExp(toPattern(stem), 'gi')
    out = out.replace(re, (match) => '*'.repeat(match.length))
  }
  return out
}