import { createContext, useContext, useEffect, useMemo, useState } from 'react'
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
  signUpWithEmail,
  signOutFb,
  changePasswordFb,
  addTeamFb,
  addCategoryFb,
  setTeamStatusFb,
  setCategoryStatusFb,
  getUserProfileFb,
  saveUserProfileFb,
  sendPasswordResetFb,
  resendVerificationFb,
  reloadUserFb,
  fbErrorMessage,
} from './firebase'

export type Difficulty = 'Легко' | 'Средне' | 'Сложно'

export type UserRole = 'organizer' | 'participant'

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

export type ChatMessage = {
  id: string
  userId?: string
  authorName: string
  text: string
  createdAt: string
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
  addReview(sphereId: string, rating: number, text: string): void
  removeReview(id: string): void
  addTeamReview(teamId: string, teamTitle: string, sphereId: string, rating: number, text: string): void
  removeTeamReview(id: string): void
  addApplication(input: NewApplication): void
  setApplicationStatus(id: string, status: 'accepted' | 'rejected'): void
  addCategory(name: string): Promise<string | null>
  addTeam(input: NewTeam): void
  approveTeam(id: string): void
  rejectTeam(id: string): void
  approveCategory(id: string): void
  rejectCategory(id: string): void
  addChatMessage(chatId: string, text: string): void
  recordVisit(sphereId: string): void
  markAllNotificationsRead(): void
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
        candidate.role ? candidate : { ...candidate, role: 'participant' },
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
            hobbies: input.hobbies.map((hobby) => hobby.trim()).filter(Boolean),
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
        hobbies: input.hobbies.map((hobby) => hobby.trim()).filter(Boolean),
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
          return fbErrorMessage(error)
        }
      }
      const normalized = rawLogin.trim().toLowerCase()
      const found = db.users.find((candidate) => candidate.login === normalized)
      if (!found || found.password !== hashPassword(password)) return 'Неверный логин или пароль'
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
      patch: Partial<Pick<User, 'name' | 'surname' | 'city' | 'telegram' | 'hobbies'>>,
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
      }
      mutate((d) => {
        const team = d.customTeams.find((candidate) => candidate.id === input.teamId)
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
      mutate((d) => {
        const application = d.applications.find((candidate) => candidate.id === id)
        if (!application) return d
        const applications = d.applications.map((candidate) =>
          candidate.id === id ? { ...candidate, status } : candidate,
        )
        const text =
          status === 'accepted'
            ? `🎉 Твою заявку в команду «${application.teamTitle}» приняли! Организатор ждёт тебя в команде.`
            : `Твою заявку в команду «${application.teamTitle}» отклонили. Попробуй другие команды!`
        const notification: Notification = {
          id: uid(),
          userId: application.userId,
          text,
          read: false,
          createdAt: new Date().toISOString(),
        }
        return { ...d, applications, notifications: [notification, ...d.notifications] }
      })
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
          return await addCategoryFb(category)
        } catch {
          return null
        }
      }
      mutate((d) => ({ ...d, customCategories: [...d.customCategories, category] }))
      return category.id
    }

    const addTeam = (input: NewTeam) => {
      if (!user) return
      const team: CustomTeam = {
        id: uid(),
        ...input,
        members: 1,
        creatorId: user.id,
        creatorName: `${user.name} ${user.surname}`.trim(),
        createdAt: new Date().toISOString(),
        status: firebaseEnabled ? 'pending' : 'approved',
      }
      if (firebaseEnabled) {
        void addTeamFb(team)
        return
      }
      mutate((d) => ({
        ...d,
        customTeams: [team, ...d.customTeams],
      }))
    }

    const approveTeam = (id: string) => {
      if (!user?.isAdmin) return
      if (firebaseEnabled) {
        void setTeamStatusFb(id, 'approved')
        return
      }
      mutate((d) => {
        const team = d.pendingTeams.find((candidate) => candidate.id === id)
        if (!team) return d
        return {
          ...d,
          customTeams: [{ ...team, status: 'approved' }, ...d.customTeams],
          pendingTeams: d.pendingTeams.filter((candidate) => candidate.id !== id),
        }
      })
    }

    const rejectTeam = (id: string) => {
      if (!user?.isAdmin) return
      if (firebaseEnabled) {
        void setTeamStatusFb(id, 'rejected')
        return
      }
      mutate((d) => ({
        ...d,
        pendingTeams: d.pendingTeams.filter((candidate) => candidate.id !== id),
      }))
    }

    const approveCategory = (id: string) => {
      if (!user?.isAdmin) return
      if (firebaseEnabled) {
        void setCategoryStatusFb(id, 'approved')
        return
      }
      mutate((d) => {
        const category = d.pendingCategories.find((candidate) => candidate.id === id)
        if (!category) return d
        return {
          ...d,
          customCategories: [{ ...category, status: 'approved' }, ...d.customCategories],
          pendingCategories: d.pendingCategories.filter((candidate) => candidate.id !== id),
        }
      })
    }

    const rejectCategory = (id: string) => {
      if (!user?.isAdmin) return
      if (firebaseEnabled) {
        void setCategoryStatusFb(id, 'rejected')
        return
      }
      mutate((d) => ({
        ...d,
        pendingCategories: d.pendingCategories.filter((candidate) => candidate.id !== id),
      }))
    }

    const addChatMessage = (chatId: string, text: string) => {
      const authorName = user ? `${user.name} ${user.surname}`.trim() : 'Гость'
      const message: ChatMessage = {
        id: uid(),
        userId: user?.id,
        authorName,
        text: censor(text),
        createdAt: new Date().toISOString(),
      }
      mutate((d) => ({
        ...d,
        chats: { ...d.chats, [chatId]: [...(d.chats[chatId] ?? []), message] },
      }))
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
      mutate((d) => ({
        ...d,
        notifications: d.notifications.map((notification) =>
          notification.userId === user.id ? { ...notification, read: true } : notification,
        ),
      }))
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
      addChatMessage,
      recordVisit,
      markAllNotificationsRead,
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


