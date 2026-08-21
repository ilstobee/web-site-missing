import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Category } from './data'
import { asset, categories as baseCategories } from './data'
import { censor } from './profanity'
import {
  firebaseEnabled,
  subscribeAuthFb,
  subscribeTeamsFb,
  subscribeCategoriesFb,
  subscribePendingTeamsFb,
  subscribePendingCategoriesFb,
  signInWithEmail,
  emailRegisteredFb,
  signUpWithEmail,
  signOutFb,
  changePasswordFb,
  changeEmailFb,
  addTeamFb,
  addCategoryFb,
  setTeamStatusFb,
  setCategoryStatusFb,
  deleteTeamFb,
  deleteCategoryFb,
  getUserProfileFb,
  saveUserProfileFb,
  sendPasswordResetFb,
  resendVerificationFb,
  reloadUserFb,
  fbErrorMessage,
  ensureChatFb,
  sendMessageFb,
  subscribeChatMessagesFb,
  subscribeParticipantChatsFb,
  addApplicationFb,
  setApplicationStatusFb,
  subscribeApplicationsFb,
  addNotificationFb,
  subscribeNotificationsFb,
  markNotificationsReadFb,
  updateTeamMembersFb,
  editMessageFb,
  deleteMessageFb,
} from './firebase'

export type Difficulty = 'Легко' | 'Средне' | 'Сложно'

export type UserRole = 'organizer' | 'participant'

export const ERR_NOT_REGISTERED = 'Такого аккаунта нет. Сначала зарегистрируйся'

export type ModerationStatus = 'pending' | 'approved' | 'rejected'

export type User = {
  id: string
  name: string
  surname: string
  login: string
  password: string
  telegram: string
  city: string
  hobbies: string[]
  interests: string[]
  seeking: 'team' | 'people' | 'project' | ''
  skills: string[]
  availability: string
  goal: string
  level: string
  online: boolean
  role: UserRole
  isAdmin?: boolean
  emailVerified?: boolean
  createdAt: string
}

export type Review = {
  id: string
  sphereId: string
  userId: string
  authorName: string
  rating: number
  text: string
  createdAt: string
}

export type Application = {
  id: string
  teamId: string
  teamTitle: string
  sphereId: string
  sphereName: string
  userId: string
  userName: string
  creatorId: string
  city: string
  contacts: string
  telegram: string
  rating: string
  review: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

export type Notification = {
  id: string
  userId: string
  text: string
  read: boolean
  createdAt: string
  chatId?: string
}

export type CustomCategory = {
  id: string
  name: string
  creatorId: string
  createdAt: string
  status: ModerationStatus
}

export type CustomTeam = {
  id: string
  title: string
  category: string
  sphereId: string
  description: string
  city: string
  difficulty: Difficulty
  capacity: number
  members: number
  creatorId: string
  creatorName: string
  tags: string[]
  createdAt: string
  status: ModerationStatus
  image?: string
}

export type TeamReview = {
  id: string
  teamId: string
  teamTitle: string
  sphereId: string
  userId: string
  authorName: string
  rating: number
  text: string
  createdAt: string
}

export type ChatAttachment = {
  kind: 'image' | 'audio'
  url: string
  name?: string
  durationMs?: number
}

export type ChatMessage = {
  id: string
  userId?: string
  authorName: string
  text: string
  createdAt: string
  edited?: boolean
  editedAt?: string
  attachments?: ChatAttachment[]
}

export type Visit = {
  sphereId: string
  userId: string
  at: string
}

type DB = {
  users: User[]
  sessionUserId: string | null
  reviews: Review[]
  teamReviews: TeamReview[]
  applications: Application[]
  notifications: Notification[]
  customCategories: CustomCategory[]
  customTeams: CustomTeam[]
  pendingCategories: CustomCategory[]
  pendingTeams: CustomTeam[]
  chats: Record<string, ChatMessage[]>
  chatRead: Record<string, string>
  visits: Visit[]
}

export type RegisterInput = {
  name: string
  surname: string
  login: string
  password: string
  telegram: string
  city: string
  hobbies: string[]
  interests: string[]
  seeking: 'team' | 'people' | 'project' | ''
  skills: string[]
  availability: string
  goal: string
  level: string
  online: boolean
  role: UserRole
  email?: string
  phone?: string
}

export type NewApplication = {
  teamId: string
  teamTitle: string
  sphereId: string
  sphereName: string
  city: string
  contacts: string
  telegram: string
  rating: string
  review: string
}

export type NewTeam = {
  title: string
  category: string
  sphereId: string
  description: string
  city: string
  difficulty: Difficulty
  capacity: number
  tags: string[]
  image?: string
}

type AppContextValue = {
  db: DB
  user: User | null
  allCategories: Category[]
  emailVerified: boolean
  register(input: RegisterInput): Promise<string | null>
  login(login: string, password: string): Promise<string | null>
  logout(): void
  markFbSession(uid: string, profile: Partial<User>): void
  sendPasswordReset(email: string): Promise<string | null>
  resendVerification(): Promise<string | null>
  refreshVerification(): Promise<boolean>
  updateProfile(patch: Partial<Pick<User, 'name' | 'surname' | 'city' | 'telegram' | 'hobbies'>>): void
  setUserRole(role: UserRole): void
  changePassword(current: string, next: string): string | null
  changeEmail(next: string): Promise<string | null>
  addReview(sphereId: string, rating: number, text: string): void
  removeReview(id: string): void
  addTeamReview(teamId: string, teamTitle: string, sphereId: string, rating: number, text: string): void
  removeTeamReview(id: string): void
  addApplication(input: NewApplication): void
  setApplicationStatus(id: string, status: 'accepted' | 'rejected'): void
  addCategory(name: string): Promise<string | null>
  addTeam(input: NewTeam): Promise<string | null>
  approveTeam(id: string): void
  rejectTeam(id: string): void
  approveCategory(id: string): void
  rejectCategory(id: string): void
  deleteTeam(id: string): void
  deleteCategory(id: string): void
  addChatMessage(chatId: string, text: string, attachments?: ChatAttachment[]): void
  editChatMessage(chatId: string, messageId: string, text: string): void
  deleteChatMessage(chatId: string, messageId: string): void
  recordVisit(sphereId: string): void
  markAllNotificationsRead(): void
  markChatRead(chatId: string): void
  setActiveChatId(chatId: string | null): void
  chatRead: Record<string, string>
  sphereStats(sphereId: string): { rating: number; reviews: number; activity: number }
  sphereName(sphereId: string): string
}

const DB_KEY = 'missing_site_db_v1'

const emptyDB: DB = {
  users: [],
  sessionUserId: null,
  reviews: [],
  teamReviews: [],
  applications: [],
  notifications: [],
  customCategories: [],
  customTeams: [],
  pendingCategories: [],
  pendingTeams: [],
  chats: {},
  chatRead: {},
  visits: [],
}

function loadDB(): DB {
  if (typeof window === 'undefined') return emptyDB
  try {
    const raw = window.localStorage.getItem(DB_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DB>
      const merged = { ...emptyDB, ...parsed }
      merged.users = (merged.users ?? []).map((candidate) =>
        candidate.role
          ? {
              ...candidate,
              interests: candidate.interests ?? [],
              seeking: candidate.seeking ?? '',
              skills: candidate.skills ?? [],
              availability: candidate.availability ?? '',
              goal: candidate.goal ?? '',
              level: candidate.level ?? '',
              online: candidate.online ?? false,
            }
          : {
              ...candidate,
              role: 'participant',
              interests: candidate.interests ?? [],
              seeking: candidate.seeking ?? '',
              skills: candidate.skills ?? [],
              availability: candidate.availability ?? '',
              goal: candidate.goal ?? '',
              level: candidate.level ?? '',
              online: candidate.online ?? false,
            },
      )
      merged.customTeams = (merged.customTeams ?? []).map((team) =>
        team.status ? team : { ...team, status: 'approved' },
      )
      merged.customCategories = (merged.customCategories ?? []).map((category) =>
        category.status ? category : { ...category, status: 'approved' },
      )
      return merged
    }
  } catch {
    // ignore corrupted storage
  }
  return emptyDB
}

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function hashPassword(password: string): string {
  let hash = 5381
  for (let i = 0; i < password.length; i += 1) {
    hash = (hash * 33) ^ password.charCodeAt(i)
  }
  return (hash >>> 0).toString(16)
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

export function dmChatId(a: string, b: string): string {
  return `dm:${[a, b].sort().join(':')}`
}

const CUSTOM_TINT = 'bg-[#fde4df]'

function toCategory(custom: CustomCategory): Category {
  return {
    id: custom.id,
    name: custom.name,
    icon: asset('images/icons/more.png'),
    tint: CUSTOM_TINT,
    info: {
      title: `Найди свою команду в сфере «${custom.name}»!`,
      subtitle:
        'Эта сфера добавлена участниками сообщества. Объединяйся, создавай команды и развивай направление вместе.',
      spheres: [],
      teams: [],
      cta: 'Пока нет команд — создай первую и собери единомышленников!',
    },
  }
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(loadDB)
  const [emailVerified, setEmailVerified] = useState(true)

  useEffect(() => {
    try {
      window.localStorage.setItem(DB_KEY, JSON.stringify(db))
    } catch {
      // ignore quota / private mode errors
    }
  }, [db])

  const mutate = (fn: (prev: DB) => DB) => setDb(fn)

  useEffect(() => {
    if (!firebaseEnabled) return
    let alive = true
    const unsubscribe = subscribeAuthFb(async (fbUser) => {
      if (!alive) return
      if (!fbUser) {
        setDb((d) => ({ ...d, sessionUserId: null }))
        return
      }
      const uid = fbUser.uid
      const fbId = `fb-${uid}`
      const profile = await getUserProfileFb(uid)
      const isAdmin =
        profile.isAdmin === true || import.meta.env.VITE_FIREBASE_ADMIN_UID === uid
      setEmailVerified(fbUser.emailVerified === true)
      setDb((d) => {
        const existing = d.users.find((candidate) => candidate.id === fbId)
        const record: User = {
          id: fbId,
          name: profile.name ?? fbUser.displayName ?? '',
          surname: profile.surname ?? '',
          login: profile.login ?? fbUser.email ?? '',
          password: '',
          telegram: profile.telegram ?? '',
          city: profile.city ?? '',
          hobbies: profile.hobbies ?? [],
          interests: profile.interests ?? [],
          seeking: profile.seeking ?? '',
          skills: profile.skills ?? [],
          availability: profile.availability ?? '',
          goal: profile.goal ?? '',
          level: profile.level ?? '',
          online: profile.online ?? false,
          role: profile.role ?? 'participant',
          isAdmin,
          emailVerified: fbUser.emailVerified,
          createdAt: profile.createdAt ?? new Date().toISOString(),
        }
        const users = existing
          ? d.users.map((candidate) => (candidate.id === fbId ? record : candidate))
          : [...d.users, record]
        return { ...d, users, sessionUserId: fbId }
      })
    })
    return () => {
      alive = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!firebaseEnabled) return
    let alive = true
    const unsubscribe = subscribeTeamsFb((teams) => {
      if (alive) setDb((d) => ({ ...d, customTeams: teams }))
    })
    return () => {
      alive = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!firebaseEnabled) return
    let alive = true
    const unsubscribe = subscribeCategoriesFb((categories) => {
      if (alive) setDb((d) => ({ ...d, customCategories: categories }))
    })
    return () => {
      alive = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!firebaseEnabled) return
    let alive = true
    const unsubscribe = subscribePendingTeamsFb((teams) => {
      if (alive) setDb((d) => ({ ...d, pendingTeams: teams }))
    })
    return () => {
      alive = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!firebaseEnabled) return
    let alive = true
    const unsubscribe = subscribePendingCategoriesFb((categories) => {
      if (alive) setDb((d) => ({ ...d, pendingCategories: categories }))
    })
    return () => {
      alive = false
      unsubscribe()
    }
  }, [])

  const user = db.users.find((candidate) => candidate.id === db.sessionUserId) ?? null

  const allCategories = useMemo<Category[]>(() => {
    const custom = db.customCategories.map(toCategory)
    return [...baseCategories, ...custom]
  }, [db.customCategories])

  const userRef = useRef<User | null>(user)
  userRef.current = user
  const dbRef = useRef<DB>(db)
  dbRef.current = db
  const allCategoriesRef = useRef<Category[]>(allCategories)
  allCategoriesRef.current = allCategories
  const activeChatRef = useRef<string | null>(null)

  useEffect(() => {
    if (!firebaseEnabled) return
    if (!user) return
    let alive = true
    const unsubApps = subscribeApplicationsFb(user.id, (applications) => {
      if (alive) setDb((d) => ({ ...d, applications }))
    })
    const unsubNotifs = subscribeNotificationsFb(user.id, (notifications) => {
      if (alive) setDb((d) => ({ ...d, notifications }))
    })
    return () => {
      alive = false
      unsubApps()
      unsubNotifs()
    }
  }, [user?.id])

  useEffect(() => {
    if (!firebaseEnabled) return
    let alive = true
    const unsubs = new Map<string, () => void>()
    const lastSeen = new Map<string, string>()

    const chatTitle = (chatId: string): string => {
      if (chatId.startsWith('dm:')) {
        const parts = chatId.slice(3).split(':')
        const me = userRef.current?.id
        const peer = parts.find((candidate) => candidate !== me) ?? parts[0]
        const peerUser = dbRef.current.users.find((candidate) => candidate.id === peer)
        return peerUser ? `${peerUser.name} ${peerUser.surname}`.trim() : 'Личный чат'
      }
      if (chatId.startsWith('team:')) {
        const team = dbRef.current.customTeams.find((candidate) => `team:${candidate.id}` === chatId)
        return team ? team.title : 'Чат команды'
      }
      return allCategoriesRef.current.find((candidate) => candidate.id === chatId)?.name ?? 'Чат'
    }

    const handleSnapshot = (chatId: string, messages: ChatMessage[]) => {
      if (!alive) return
      const sorted = [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      setDb((d) => {
        const prev = d.chats[chatId] ?? []
        const byId = new Map<string, ChatMessage>()
        prev.forEach((candidate) => byId.set(candidate.id, candidate))
        sorted.forEach((candidate) => byId.set(candidate.id, candidate))
        return {
          ...d,
          chats: {
            ...d.chats,
            [chatId]: Array.from(byId.values()).sort((a, b) =>
              a.createdAt.localeCompare(b.createdAt),
            ),
          },
        }
      })
      const last = sorted[sorted.length - 1]
      const known = lastSeen.get(chatId)
      lastSeen.set(chatId, last ? last.id : '')
      if (!last || !known || last.id === known) return
      if (last.userId === userRef.current?.id) return
      const incoming = `💬 ${last.authorName}: ${last.text}`
      const inActive = activeChatRef.current === chatId
      const notification: Notification = {
        id: uid(),
        userId: userRef.current?.id ?? '',
        text: incoming,
        read: inActive,
        createdAt: new Date().toISOString(),
        chatId,
      }
      if (firebaseEnabled) {
        addNotificationFb(notification)
        if (inActive) {
          setDb((d) => ({ ...d, chatRead: { ...d.chatRead, [chatId]: last.createdAt } }))
        }
      } else {
        setDb((d) => ({
          ...d,
          notifications: [notification, ...d.notifications],
          ...(inActive ? { chatRead: { ...d.chatRead, [chatId]: last.createdAt } } : {}),
        }))
      }
      if (!inActive && typeof window !== 'undefined' && 'Notification' in window) {
        try {
          if (
            Notification.permission === 'granted' &&
            document.hidden &&
            typeof Notification !== 'undefined'
          ) {
            new Notification(chatTitle(chatId), { body: `${last.authorName}: ${last.text}` })
          }
        } catch {
          // ignore notification errors
        }
      }
    }

    const subscribe = (chatId: string) => {
      if (unsubs.has(chatId)) return
      unsubs.set(
        chatId,
        subscribeChatMessagesFb(chatId, (messages) => handleSnapshot(chatId, messages)),
      )
    }

    const refresh = () => {
      if (!alive) return
      const ids = new Set<string>()
      allCategoriesRef.current.forEach((candidate) => ids.add(candidate.id))
      dbRef.current.customTeams.forEach((candidate) => ids.add(`team:${candidate.id}`))
      Object.keys(dbRef.current.chats).forEach((chatId) => ids.add(chatId))
      ids.forEach(subscribe)
    }

    const unsubscribeParticipant = subscribeParticipantChatsFb(userRef.current?.id ?? '', (chatIds) => {
      if (!alive) return
      chatIds.forEach(subscribe)
    })

    refresh()
    const interval = window.setInterval(refresh, 10000)

    return () => {
      alive = false
      window.clearInterval(interval)
      unsubscribeParticipant()
      unsubs.forEach((unsubscribe) => unsubscribe())
    }
  }, [])

  const value = useMemo<AppContextValue>(() => {
    const register = async (input: RegisterInput): Promise<string | null> => {
      const login = input.login.trim().toLowerCase()
      if (!input.name.trim() || !input.surname.trim()) return 'Заполни имя и фамилию'
      if (!login) return 'Придумай логин'
      if (input.password.length < 8) return 'Пароль должен быть минимум 8 символов'
      if (!input.city.trim()) return 'Укажи свой город'
      if (!input.telegram.trim()) return 'Укажи свой Telegram'

      if (firebaseEnabled) {
        const rawEmail = input.email?.trim() || ''
        if (!isValidEmail(rawEmail)) return 'Введи корректный email'
        const email = rawEmail
        try {
          const fbUser = await signUpWithEmail(email, input.password)
          const profile = {
            name: input.name.trim(),
            surname: input.surname.trim(),
            city: input.city.trim(),
            telegram: input.telegram.trim(),
            hobbies: input.interests.map((hobby) => hobby.trim()).filter(Boolean),
            interests: input.interests.map((hobby) => hobby.trim()).filter(Boolean),
            seeking: input.seeking,
            skills: input.skills.map((skill) => skill.trim()).filter(Boolean),
            availability: input.availability,
            goal: input.goal.trim(),
            level: input.level,
            online: input.online,
            role: input.role,
            login,
          }
          await saveUserProfileFb(fbUser.uid, profile)
          markFbSession(fbUser.uid, profile)
          return null
        } catch (error) {
          return fbErrorMessage(error)
        }
      }

      if (db.users.some((existing) => existing.login === login)) return 'Такой логин уже занят'

      const newUser: User = {
        id: uid(),
        name: input.name.trim(),
        surname: input.surname.trim(),
        login,
        password: hashPassword(input.password),
        telegram: input.telegram.trim(),
        city: input.city.trim(),
        hobbies: input.interests.map((hobby) => hobby.trim()).filter(Boolean),
        interests: input.interests.map((hobby) => hobby.trim()).filter(Boolean),
        seeking: input.seeking,
        skills: input.skills.map((skill) => skill.trim()).filter(Boolean),
        availability: input.availability,
        goal: input.goal.trim(),
        level: input.level,
        online: input.online,
        role: input.role,
        createdAt: new Date().toISOString(),
      }
      mutate((d) => ({ ...d, users: [...d.users, newUser], sessionUserId: newUser.id }))
      return null
    }

    const login = async (rawLogin: string, password: string): Promise<string | null> => {
      if (firebaseEnabled) {
        const email = rawLogin.includes('@')
          ? rawLogin.trim()
          : `${rawLogin.trim().toLowerCase()}@missing.app`
        try {
          await signInWithEmail(email, password)
          return null
        } catch (error) {
          if (!(await emailRegisteredFb(email))) return ERR_NOT_REGISTERED
          return fbErrorMessage(error)
        }
      }
      const normalized = rawLogin.trim().toLowerCase()
      const found = db.users.find((candidate) => candidate.login === normalized)
      if (!found) return ERR_NOT_REGISTERED
      if (found.password !== hashPassword(password)) return 'Неверный пароль'
      mutate((d) => ({ ...d, sessionUserId: found.id }))
      return null
    }

    const logout = () => {
      if (firebaseEnabled) {
        void signOutFb()
      }
      mutate((d) => ({ ...d, sessionUserId: null }))
    }

    const sendPasswordReset = async (email: string): Promise<string | null> => {
      const trimmed = email.trim()
      if (!isValidEmail(trimmed)) return 'Введи корректный email'
      try {
        await sendPasswordResetFb(trimmed)
        return null
      } catch (error) {
        return fbErrorMessage(error)
      }
    }

    const resendVerification = async (): Promise<string | null> => {
      try {
        await resendVerificationFb()
        return null
      } catch (error) {
        return fbErrorMessage(error)
      }
    }

    const refreshVerification = async (): Promise<boolean> => {
      if (!firebaseEnabled) return true
      try {
        const verified = await reloadUserFb()
        setEmailVerified(verified)
        return verified
      } catch {
        return false
      }
    }

    const markFbSession = (uid: string, profile: Partial<User>) => {
      const fbId = `fb-${uid}`
      mutate((d) => {
        const existing = d.users.find((candidate) => candidate.id === fbId)
        const record: User = {
          id: fbId,
          name: profile.name ?? existing?.name ?? '',
          surname: profile.surname ?? existing?.surname ?? '',
          login: profile.login ?? existing?.login ?? '',
          password: '',
          telegram: profile.telegram ?? existing?.telegram ?? '',
          city: profile.city ?? existing?.city ?? '',
          hobbies: profile.hobbies ?? existing?.hobbies ?? [],
          interests: profile.interests ?? existing?.interests ?? [],
          seeking: profile.seeking ?? existing?.seeking ?? '',
          skills: profile.skills ?? existing?.skills ?? [],
          availability: profile.availability ?? existing?.availability ?? '',
          goal: profile.goal ?? existing?.goal ?? '',
          level: profile.level ?? existing?.level ?? '',
          online: profile.online ?? existing?.online ?? false,
          role: profile.role ?? existing?.role ?? 'participant',
          isAdmin:
            profile.isAdmin ?? existing?.isAdmin ?? import.meta.env.VITE_FIREBASE_ADMIN_UID === uid,
          createdAt: existing?.createdAt ?? new Date().toISOString(),
        }
        const users = existing
          ? d.users.map((candidate) => (candidate.id === fbId ? record : candidate))
          : [...d.users, record]
        return { ...d, users, sessionUserId: fbId }
      })
    }

    const updateProfile = (
      patch: Partial<
        Pick<
          User,
          | 'name'
          | 'surname'
          | 'city'
          | 'telegram'
          | 'hobbies'
          | 'interests'
          | 'seeking'
          | 'skills'
          | 'availability'
          | 'goal'
          | 'level'
          | 'online'
        >
      >,
    ) => {
      if (!user) return
      const cleaned = { ...patch }
      for (const key of ['name', 'surname', 'city', 'telegram'] as const) {
        const raw = cleaned[key]
        if (typeof raw === 'string') cleaned[key] = raw.trim()
      }
      if (Array.isArray(cleaned.hobbies)) {
        cleaned.hobbies = cleaned.hobbies.map((hobby) => hobby.trim()).filter(Boolean)
      }
      mutate((d) => ({
        ...d,
        users: d.users.map((candidate) =>
          candidate.id === user.id ? { ...candidate, ...cleaned } : candidate,
        ),
      }))
      if (firebaseEnabled && user.id.startsWith('fb-')) {
        void saveUserProfileFb(user.id.slice(3), cleaned)
      }
    }

    const changePassword = (current: string, next: string): string | null => {
      if (!user) return 'Сначала войди в аккаунт'
      if (next.length < 8) return 'Новый пароль слишком короткий (минимум 8 символов)'
      if (firebaseEnabled && user.id.startsWith('fb-')) {
        if (user.password && user.password !== hashPassword(current)) {
          return 'Текущий пароль неверный'
        }
        void changePasswordFb(next)
        mutate((d) => ({
          ...d,
          users: d.users.map((candidate) =>
            candidate.id === user.id ? { ...candidate, password: hashPassword(next) } : candidate,
          ),
        }))
        return null
      }
      if (user.password !== hashPassword(current)) return 'Текущий пароль неверный'
      mutate((d) => ({
        ...d,
        users: d.users.map((candidate) =>
          candidate.id === user.id ? { ...candidate, password: hashPassword(next) } : candidate,
        ),
      }))
      return null
    }

    const changeEmail = async (next: string): Promise<string | null> => {
      if (!user) return 'Сначала войди в аккаунт'
      const trimmed = next.trim().toLowerCase()
      if (!trimmed) return 'Введи email'
      if (!isValidEmail(trimmed)) return 'Введи корректный email'
      if (trimmed === user.login.toLowerCase()) return null
      if (firebaseEnabled && user.id.startsWith('fb-')) {
        try {
          await changeEmailFb(trimmed)
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          if (message.includes('recent-login')) {
            return 'Войди в аккаунт заново, затем повтори попытку'
          }
          if (message.includes('email-already-in-use')) return 'Этот email уже используется'
          if (message.includes('invalid-email')) return 'Некорректный email'
          return 'Не удалось сменить email. Попробуй ещё раз'
        }
      }
      mutate((d) => ({
        ...d,
        users: d.users.map((candidate) =>
          candidate.id === user.id ? { ...candidate, login: trimmed } : candidate,
        ),
      }))
      return null
    }

    const setUserRole = (role: UserRole) => {
      if (!user) return
      mutate((d) => ({
        ...d,
        users: d.users.map((candidate) =>
          candidate.id === user.id ? { ...candidate, role } : candidate,
        ),
      }))
      if (firebaseEnabled && user.id.startsWith('fb-')) {
        void saveUserProfileFb(user.id.slice(3), { role })
      }
    }

    const addReview = (sphereId: string, rating: number, text: string) => {
      if (!user) return
      const review: Review = {
        id: uid(),
        sphereId,
        userId: user.id,
        authorName: `${user.name} ${user.surname}`.trim(),
        rating,
        text: censor(text),
        createdAt: new Date().toISOString(),
      }
      mutate((d) => ({ ...d, reviews: [review, ...d.reviews] }))
    }

    const addTeamReview = (
      teamId: string,
      teamTitle: string,
      sphereId: string,
      rating: number,
      text: string,
    ) => {
      if (!user) return
      const review: TeamReview = {
        id: uid(),
        teamId,
        teamTitle,
        sphereId,
        userId: user.id,
        authorName: `${user.name} ${user.surname}`.trim(),
        rating,
        text: censor(text),
        createdAt: new Date().toISOString(),
      }
      mutate((d) => ({ ...d, teamReviews: [review, ...d.teamReviews] }))
    }

    const removeReview = (id: string) => {
      if (!user) return
      mutate((d) => ({
        ...d,
        reviews: d.reviews.filter((review) => !(review.id === id && review.userId === user.id)),
      }))
    }

    const removeTeamReview = (id: string) => {
      if (!user) return
      mutate((d) => ({
        ...d,
        teamReviews: d.teamReviews.filter(
          (review) => !(review.id === id && review.userId === user.id),
        ),
      }))
    }

    const addApplication = (input: NewApplication) => {
      if (!user) return
      const team = db.customTeams.find((candidate) => candidate.id === input.teamId)
      if (team && team.creatorId === user.id) return
      const application: Application = {
        id: uid(),
        ...input,
        userId: user.id,
        userName: `${user.name} ${user.surname}`.trim(),
        review: censor(input.review),
        status: 'pending',
        createdAt: new Date().toISOString(),
        creatorId: team?.creatorId ?? '',
      }
      if (firebaseEnabled) {
        void addApplicationFb(application)
        if (team) {
          addNotificationFb({
            id: uid(),
            userId: team.creatorId,
            text: `📩 ${application.userName} оставил(а) заявку в твою команду «${team.title}»! Загляни в личный кабинет.`,
            read: false,
            createdAt: new Date().toISOString(),
          })
        }
        return
      }
      mutate((d) => {
        let notifications = [...d.notifications]
        if (team) {
          const notification: Notification = {
            id: uid(),
            userId: team.creatorId,
            text: `📩 ${application.userName} оставил(а) заявку в твою команду «${team.title}»! Загляни в личный кабинет.`,
            read: false,
            createdAt: new Date().toISOString(),
          }
          notifications = [notification, ...notifications]
        }
        return { ...d, applications: [application, ...d.applications], notifications }
      })
    }

    const setApplicationStatus = (id: string, status: 'accepted' | 'rejected') => {
      const application = db.applications.find((candidate) => candidate.id === id)
      if (!application) return
      const text =
        status === 'accepted'
          ? `🎉 Твою заявку в команду «${application.teamTitle}» приняли! Организатор ждёт тебя в команде.`
          : `Твою заявку в команду «${application.teamTitle}» отклонили. Попробуй другие команды!`
      const nextApplications = db.applications.map((candidate) =>
        candidate.id === id ? { ...candidate, status } : candidate,
      )
      const members =
        1 +
        nextApplications.filter(
          (candidate) =>
            candidate.teamId === application.teamId && candidate.status === 'accepted',
        ).length
      const notification: Notification = {
        id: uid(),
        userId: application.userId,
        text,
        read: false,
        createdAt: new Date().toISOString(),
      }
      const applyTeamMembers = (d: DB): DB => ({
        ...d,
        customTeams: d.customTeams.map((team) =>
          team.id === application.teamId ? { ...team, members } : team,
        ),
        pendingTeams: d.pendingTeams.map((team) =>
          team.id === application.teamId ? { ...team, members } : team,
        ),
      })
      if (firebaseEnabled) {
        void setApplicationStatusFb(id, status)
        void updateTeamMembersFb(application.teamId, members)
        addNotificationFb(notification)
        mutate((d) => ({ ...applyTeamMembers(d), applications: nextApplications }))
        return
      }
      mutate((d) => ({
        ...applyTeamMembers(d),
        applications: nextApplications,
        notifications: [notification, ...d.notifications],
      }))
    }

    const addCategory = async (name: string): Promise<string | null> => {
      if (!user) return null
      const trimmed = name.trim()
      if (!trimmed) return null
      if (allCategories.some((category) => category.name.toLowerCase() === trimmed.toLowerCase())) {
        return null
      }
      const category: CustomCategory = {
        id: uid(),
        name: trimmed,
        creatorId: user.id,
        createdAt: new Date().toISOString(),
        status: firebaseEnabled ? 'pending' : 'approved',
      }
      if (firebaseEnabled) {
        try {
          const id = await addCategoryFb(category)
          if (adminId && adminId !== user.id) {
            notify(adminId, `Новая сфера на модерации: «${category.name}»`)
          }
          return id
        } catch {
          return null
        }
      }
      mutate((d) => ({ ...d, customCategories: [...d.customCategories, category] }))
      return category.id
    }

    const addTeam = async (input: NewTeam): Promise<string | null> => {
      if (!user) return 'Сначала войди в аккаунт'
      const isFbUser = user.id.startsWith('fb-')
      const team: CustomTeam = {
        id: uid(),
        ...input,
        members: 1,
        creatorId: user.id,
        creatorName: `${user.name} ${user.surname}`.trim(),
        createdAt: new Date().toISOString(),
        status: firebaseEnabled && isFbUser ? 'pending' : 'approved',
      }
      if (firebaseEnabled && isFbUser) {
        try {
          await addTeamFb(team)
          if (adminId && adminId !== user.id) {
            notify(adminId, `Новая команда на модерации: «${team.title}»`)
          }
          return null
        } catch (error) {
          return fbErrorMessage(error)
        }
      }
      mutate((d) => ({
        ...d,
        customTeams: [team, ...d.customTeams],
      }))
      return null
    }

    const adminId = import.meta.env.VITE_FIREBASE_ADMIN_UID
      ? `fb-${import.meta.env.VITE_FIREBASE_ADMIN_UID}`
      : ''

    const notify = (userId: string, text: string) => {
      const notification: Notification = {
        id: uid(),
        userId,
        text,
        read: false,
        createdAt: new Date().toISOString(),
      }
      if (firebaseEnabled) {
        addNotificationFb(notification)
      } else {
        mutate((d) => ({ ...d, notifications: [notification, ...d.notifications] }))
      }
    }

    const approveTeam = (id: string) => {
      if (!user?.isAdmin) return
      const team = dbRef.current.pendingTeams.find((candidate) => candidate.id === id)
      if (firebaseEnabled) {
        void setTeamStatusFb(id, 'approved')
      } else if (team) {
        mutate((d) => ({
          ...d,
          customTeams: [{ ...team, status: 'approved' }, ...d.customTeams],
          pendingTeams: d.pendingTeams.filter((candidate) => candidate.id !== id),
        }))
      }
      if (team && team.creatorId !== user.id) {
        notify(team.creatorId, `Команда «${team.title}» одобрена и опубликована!`)
      }
    }

    const rejectTeam = (id: string) => {
      if (!user?.isAdmin) return
      const team = dbRef.current.pendingTeams.find((candidate) => candidate.id === id)
      if (firebaseEnabled) {
        void setTeamStatusFb(id, 'rejected')
      } else {
        mutate((d) => ({
          ...d,
          pendingTeams: d.pendingTeams.filter((candidate) => candidate.id !== id),
        }))
      }
      if (team && team.creatorId !== user.id) {
        notify(team.creatorId, `Команда «${team.title}» отклонена.`)
      }
    }

    const approveCategory = (id: string) => {
      if (!user?.isAdmin) return
      const category = dbRef.current.pendingCategories.find((candidate) => candidate.id === id)
      if (firebaseEnabled) {
        void setCategoryStatusFb(id, 'approved')
      } else if (category) {
        mutate((d) => ({
          ...d,
          customCategories: [{ ...category, status: 'approved' }, ...d.customCategories],
          pendingCategories: d.pendingCategories.filter((candidate) => candidate.id !== id),
        }))
      }
      if (category && category.creatorId !== user.id) {
        notify(category.creatorId, `Сфера «${category.name}» одобрена и добавлена в список!`)
      }
    }

    const rejectCategory = (id: string) => {
      if (!user?.isAdmin) return
      const category = dbRef.current.pendingCategories.find((candidate) => candidate.id === id)
      if (firebaseEnabled) {
        void setCategoryStatusFb(id, 'rejected')
      } else {
        mutate((d) => ({
          ...d,
          pendingCategories: d.pendingCategories.filter((candidate) => candidate.id !== id),
        }))
      }
      if (category && category.creatorId !== user.id) {
        notify(category.creatorId, `Сфера «${category.name}» отклонена.`)
      }
    }

    const deleteTeam = (id: string) => {
      if (!user) return
      const target =
        dbRef.current.customTeams.find((candidate) => candidate.id === id) ??
        dbRef.current.pendingTeams.find((candidate) => candidate.id === id)
      if (!target) return
      if (!user.isAdmin && target.creatorId !== user.id) return
      mutate((d) => ({
        ...d,
        customTeams: d.customTeams.filter((candidate) => candidate.id !== id),
        pendingTeams: d.pendingTeams.filter((candidate) => candidate.id !== id),
        applications: d.applications.filter((application) => application.teamId !== id),
        teamReviews: d.teamReviews.filter((review) => review.teamId !== id),
        chats: Object.fromEntries(
          Object.entries(d.chats).filter(([chatId]) => chatId !== `team:${id}`),
        ),
      }))
      if (firebaseEnabled) {
        deleteTeamFb(id).catch((error) => {
          console.error('[missing] Не удалось удалить команду:', error)
          window.alert('Не удалось удалить команду. Проверь правила доступа в Firebase.')
        })
      }
    }

    const deleteCategory = (id: string) => {
      if (!user) return
      const target =
        dbRef.current.customCategories.find((candidate) => candidate.id === id) ??
        dbRef.current.pendingCategories.find((candidate) => candidate.id === id)
      if (!target) return
      if (!user.isAdmin && target.creatorId !== user.id) return
      const removedTeamIds = new Set(
        dbRef.current.customTeams
          .concat(dbRef.current.pendingTeams)
          .filter(
            (team) =>
              team.sphereId === id ||
              team.category.toLowerCase() === target.name.toLowerCase(),
          )
          .map((team) => team.id),
      )
      mutate((d) => ({
        ...d,
        customCategories: d.customCategories.filter((candidate) => candidate.id !== id),
        pendingCategories: d.pendingCategories.filter((candidate) => candidate.id !== id),
        customTeams: d.customTeams.filter((team) => !removedTeamIds.has(team.id)),
        pendingTeams: d.pendingTeams.filter((team) => !removedTeamIds.has(team.id)),
        applications: d.applications.filter(
          (application) => !removedTeamIds.has(application.teamId),
        ),
        reviews: d.reviews.filter((review) => review.sphereId !== id),
        teamReviews: d.teamReviews.filter(
          (review) => review.sphereId !== id || removedTeamIds.has(review.teamId),
        ),
        chats: Object.fromEntries(
          Object.entries(d.chats).filter(
            ([chatId]) =>
              chatId !== id &&
              !Array.from(removedTeamIds).some((teamId) => chatId === `team:${teamId}`),
          ),
        ),
      }))
      if (firebaseEnabled) {
        deleteCategoryFb(id).catch((error) => {
          console.error('[missing] Не удалось удалить сферу:', error)
          window.alert('Не удалось удалить сферу. Проверь правила доступа в Firebase.')
        })
      }
    }

    const addChatMessage = (chatId: string, text: string, attachments?: ChatAttachment[]) => {
      const authorName = user ? `${user.name} ${user.surname}`.trim() : 'Гость'
      const message: ChatMessage = {
        id: uid(),
        userId: user?.id,
        authorName,
        text: censor(text),
        createdAt: new Date().toISOString(),
        ...(attachments && attachments.length > 0 ? { attachments } : {}),
      }
      mutate((d) => ({
        ...d,
        chats: { ...d.chats, [chatId]: [...(d.chats[chatId] ?? []), message] },
      }))
      if (firebaseEnabled && user) {
        const kind = chatId.startsWith('dm:')
          ? 'dm'
          : chatId.startsWith('team:')
            ? 'team'
            : 'sphere'
        if (kind === 'dm') {
          ensureChatFb(chatId, { kind, participants: chatId.slice(3).split(':') })
        } else {
          ensureChatFb(chatId, { kind })
        }
        sendMessageFb(chatId, message)
      }
    }

    const editChatMessage = (chatId: string, messageId: string, text: string) => {
      const value = censor(text.trim())
      if (!value) return
      const now = new Date().toISOString()
      mutate((d) => ({
        ...d,
        chats: {
          ...d.chats,
          [chatId]: (d.chats[chatId] ?? []).map((message) =>
            message.id === messageId
              ? { ...message, text: value, edited: true, editedAt: now }
              : message,
          ),
        },
      }))
      if (firebaseEnabled) {
        editMessageFb(chatId, messageId, value)
      }
    }

    const deleteChatMessage = (chatId: string, messageId: string) => {
      mutate((d) => ({
        ...d,
        chats: {
          ...d.chats,
          [chatId]: (d.chats[chatId] ?? []).filter((message) => message.id !== messageId),
        },
      }))
      if (firebaseEnabled) {
        deleteMessageFb(chatId, messageId)
      }
    }

    const recordVisit = (sphereId: string) => {
      if (!user) return
      mutate((d) => {
        const rest = d.visits.filter(
          (visit) => !(visit.sphereId === sphereId && visit.userId === user.id),
        )
        return {
          ...d,
          visits: [{ sphereId, userId: user.id, at: new Date().toISOString() }, ...rest],
        }
      })
    }

    const markAllNotificationsRead = () => {
      if (!user) return
      if (firebaseEnabled) {
        void markNotificationsReadFb(user.id)
        return
      }
      mutate((d) => ({
        ...d,
        notifications: d.notifications.map((notification) =>
          notification.userId === user.id ? { ...notification, read: true } : notification,
        ),
      }))
    }

    const markChatRead = (chatId: string) => {
      if (!user) return
      mutate((d) => ({ ...d, chatRead: { ...d.chatRead, [chatId]: new Date().toISOString() } }))
    }

    const setActiveChatId = (chatId: string | null) => {
      activeChatRef.current = chatId
    }

    const sphereStats = (sphereId: string) => {
      const reviews = db.reviews.filter((review) => review.sphereId === sphereId)
      const accepted = db.applications.filter(
        (application) => application.sphereId === sphereId && application.status === 'accepted',
      )
      const visits = db.visits.filter((visit) => visit.sphereId === sphereId)
      const activity = reviews.length + accepted.length + visits.length
      const rating = reviews.length
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0
      return { rating, reviews: reviews.length, activity }
    }

    const sphereName = (sphereId: string) =>
      allCategories.find((category) => category.id === sphereId)?.name ?? sphereId

    return {
      db,
      user,
      allCategories,
      emailVerified,
      register,
      login,
      logout,
      markFbSession,
      sendPasswordReset,
      resendVerification,
      refreshVerification,
      updateProfile,
      setUserRole,
      changePassword,
      changeEmail,
      addReview,
      removeReview,
      addTeamReview,
      removeTeamReview,
      addApplication,
      setApplicationStatus,
      addCategory,
      addTeam,
      approveTeam,
      rejectTeam,
      approveCategory,
      rejectCategory,
      deleteTeam,
      deleteCategory,
      addChatMessage,
      editChatMessage,
      deleteChatMessage,
      recordVisit,
      markAllNotificationsRead,
      markChatRead,
      setActiveChatId,
      chatRead: db.chatRead,
      sphereStats,
      sphereName,
    }
  }, [db, user, allCategories, emailVerified])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}


