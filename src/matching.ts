import type { User } from './store'
import type { Team } from './data'

export type Seeking = 'team' | 'people' | 'project' | ''

export const INTEREST_OPTIONS: string[] = [
  'Путешествия',
  'Видеоигры',
  'Спорт',
  'Дискотеки',
  'Кафе и рестораны',
  'IT',
  'Дизайн',
  'Искусство',
  'Музыка',
  'Кино',
  'Фото',
  'Танцы',
  'Образование',
  'Книги',
  'Наука',
  'Стартапы',
  'Экология',
  'Волонтёрство',
  'Языки',
  'Настольные игры',
  'Походы',
]

export const SEEKING_OPTIONS: { value: Seeking; label: string; hint: string }[] = [
  { value: 'team', label: 'Команду', hint: 'присоединиться к готовой команде' },
  { value: 'people', label: 'Людей', hint: 'найти единомышленников' },
  { value: 'project', label: 'Проект', hint: 'собрать свою команду под идею' },
]

export const LEVEL_OPTIONS: string[] = ['Новичок', 'Любитель', 'Профи']

export const AVAILABILITY_OPTIONS: string[] = [
  'Свободен по утрам',
  'Свободен днём',
  'Свободен по вечерам',
  'Свободен на выходных',
  'Гибкий график',
]

export type Compat = { score: number; reasons: string[] }

type MatchTeam = {
  id: string
  title: string
  category: string
  tags: string[]
  city: string
  difficulty: string
  description: string
  sphereId?: string
}

export function toMatchTeam(team: Team | { id: string; title: string; category: string; tags: string[]; city: string; difficulty: string; description: string; sphereId?: string }): MatchTeam {
  return {
    id: team.id,
    title: team.title,
    category: team.category,
    tags: team.tags ?? [],
    city: team.city ?? '',
    difficulty: team.difficulty ?? '',
    description: team.description ?? '',
    sphereId: team.sphereId,
  }
}

const norm = (value: string) => value.trim().toLowerCase()
const lowerSet = (values: string[]) => new Set(values.map(norm).filter(Boolean))

const LEVEL_TO_DIFFICULTY: Record<string, string> = {
  Новичок: 'Легко',
  Любитель: 'Средне',
  Профи: 'Сложно',
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^а-яёa-z0-9]+/i)
    .map((word) => word.trim())
    .filter((word) => word.length >= 4)
}

export function teamCompatibility(user: Partial<User>, team: MatchTeam): Compat {
  const reasons: string[] = []
  let score = 0

  const userInterests = lowerSet(user.interests ?? [])
  const haystack = lowerSet([team.category, ...team.tags, ...tokenize(team.description)])
  const shared = [...userInterests].filter((interest) => haystack.has(interest))
  if (shared.length > 0) {
    score += Math.min(40, 14 + shared.length * 13)
    const labels = shared
      .map((interest) => INTEREST_OPTIONS.find((option) => norm(option) === interest) ?? interest)
      .slice(0, 3)
    reasons.push(`общие интересы: ${labels.join(', ')}`)
  }

  const userCity = norm(user.city ?? '')
  const teamCity = norm(team.city)
  if (user?.online) {
    score += 15
    reasons.push('готов(а) работать онлайн')
  } else if (userCity && teamCity && userCity === teamCity) {
    score += 15
    reasons.push(`один город — ${user.city}`)
  } else if (!teamCity) {
    score += 12
    reasons.push('локация не важна')
  } else if (userCity) {
    score += 6
    reasons.push('близкие города')
  }

  const userSkills = lowerSet(user.skills ?? [])
  const skillMatch = [...userSkills].filter((skill) => haystack.has(skill))
  if (skillMatch.length > 0) {
    score += Math.min(15, 8 + skillMatch.length * 4)
    reasons.push(`нужные навыки: ${skillMatch.slice(0, 3).join(', ')}`)
  }

  const userLevel = user.level ?? ''
  const preferredDifficulty = LEVEL_TO_DIFFICULTY[userLevel]
  if (preferredDifficulty && norm(preferredDifficulty) === norm(team.difficulty)) {
    score += 10
    reasons.push(`подходящий уровень — ${team.difficulty}`)
  }

  const goalTokens = tokenize(user.goal ?? '')
  if (goalTokens.length > 0) {
    const goalHit = goalTokens.filter((token) => haystack.has(token))
    if (goalHit.length > 0) {
      score += Math.min(15, 8 + goalHit.length * 3)
      reasons.push('похожие цели')
    }
  }

  if (user.availability) {
    score += 5
    reasons.push(user.availability)
  }

  if (team.description && score < 30 && userInterests.size === 0) {
    score += 8
  }

  return { score: Math.max(4, Math.min(100, Math.round(score))), reasons: reasons.slice(0, 4) }
}

export function rankTeams(user: Partial<User>, teams: MatchTeam[]): (MatchTeam & Compat)[] {
  return teams
    .map((team) => ({ ...team, ...teamCompatibility(user, team) }))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
}

export function userCompatibility(a: Partial<User>, b: Partial<User>): Compat {
  const reasons: string[] = []
  let score = 0

  const aInterests = lowerSet(a.interests ?? [])
  const bInterests = lowerSet(b.interests ?? [])
  const shared = [...aInterests].filter((interest) => bInterests.has(interest))
  if (shared.length > 0) {
    score += Math.min(40, 14 + shared.length * 13)
    const labels = shared
      .map((interest) => INTEREST_OPTIONS.find((option) => norm(option) === interest) ?? interest)
      .slice(0, 3)
    reasons.push(`общие интересы: ${labels.join(', ')}`)
  }

  const aCity = norm(a.city ?? '')
  const bCity = norm(b.city ?? '')
  if (a?.online || b?.online) {
    score += 15
    reasons.push('можно онлайн')
  } else if (aCity && bCity && aCity === bCity) {
    score += 15
    reasons.push(`один город — ${a.city}`)
  }

  const aSkills = lowerSet(a.skills ?? [])
  const bSkills = lowerSet(b.skills ?? [])
  const skillMatch = [...aSkills].filter((skill) => bSkills.has(skill))
  if (skillMatch.length > 0) {
    score += Math.min(15, 8 + skillMatch.length * 4)
    reasons.push(`пересекающиеся навыки: ${skillMatch.slice(0, 3).join(', ')}`)
  }

  const aLevel = a.level ?? ''
  const bLevel = b.level ?? ''
  if (aLevel && aLevel === bLevel) {
    score += 10
    reasons.push(`один уровень — ${aLevel}`)
  }

  if (a.goal && b.goal && norm(a.goal) === norm(b.goal)) {
    score += 15
    reasons.push('одинаковая цель')
  } else if (a.goal && b.goal) {
    const aTokens = tokenize(a.goal)
    const bTokens = lowerSet(b.goal ? tokenize(b.goal) : [])
    if (aTokens.some((token) => bTokens.has(token))) {
      score += 8
      reasons.push('похожие цели')
    }
  }

  if (a.availability && a.availability === b.availability) {
    score += 5
    reasons.push(a.availability)
  }

  return { score: Math.max(4, Math.min(100, Math.round(score))), reasons: reasons.slice(0, 4) }
}
