import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateEmail,
  reload,
  updatePassword,
  fetchSignInMethodsForEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  type Auth,
  type User as FirebaseUser,
  type ConfirmationResult,
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  writeBatch,
  deleteDoc,
  type Firestore,
  type Query,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from 'firebase/storage'
import type {
  Application,
  ChatMessage,
  CustomCategory,
  CustomTeam,
  ModerationStatus,
  Notification,
  User,
  UserRole,
} from './store'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
}

export const firebaseEnabled = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

export const app: FirebaseApp | null = firebaseEnabled ? initializeApp(firebaseConfig) : null
export const auth: Auth | null = firebaseEnabled && app ? getAuth(app) : null
export const db: Firestore | null = firebaseEnabled && app ? getFirestore(app) : null
export const storage: FirebaseStorage | null = firebaseEnabled && app ? getStorage(app) : null

export type ProfilePatch = {
  name?: string
  surname?: string
  city?: string
  telegram?: string
  hobbies?: string[]
  interests?: string[]
  seeking?: 'team' | 'people' | 'project' | ''
  skills?: string[]
  availability?: string
  goal?: string
  level?: string
  online?: boolean
  role?: UserRole
  login?: string
  isAdmin?: boolean
}

function buildPatch(profile: ProfilePatch): Record<string, unknown> {
  const patch: Record<string, unknown> = {}
  if (profile.name !== undefined) patch.name = profile.name
  if (profile.surname !== undefined) patch.surname = profile.surname
  if (profile.city !== undefined) patch.city = profile.city
  if (profile.telegram !== undefined) patch.telegram = profile.telegram
  if (profile.hobbies !== undefined) patch.hobbies = profile.hobbies
  if (profile.interests !== undefined) patch.interests = profile.interests
  if (profile.seeking !== undefined) patch.seeking = profile.seeking
  if (profile.skills !== undefined) patch.skills = profile.skills
  if (profile.availability !== undefined) patch.availability = profile.availability
  if (profile.goal !== undefined) patch.goal = profile.goal
  if (profile.level !== undefined) patch.level = profile.level
  if (profile.online !== undefined) patch.online = profile.online
  if (profile.role !== undefined) patch.role = profile.role
  if (profile.login !== undefined) patch.login = profile.login
  if (profile.isAdmin !== undefined) patch.isAdmin = profile.isAdmin
  return patch
}

export async function signUpWithEmail(email: string, password: string): Promise<FirebaseUser> {
  if (!auth) throw new Error('Firebase не настроен')
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await sendEmailVerification(credential.user)
  return credential.user
}

export async function changePasswordFb(next: string): Promise<void> {
  if (!auth) throw new Error('Firebase не настроен')
  const current = auth.currentUser
  if (!current) throw new Error('Сначала войди в аккаунт')
  await updatePassword(current, next)
}

export async function changeEmailFb(next: string): Promise<void> {
  if (!auth) throw new Error('Firebase не настроен')
  const current = auth.currentUser
  if (!current) throw new Error('Сначала войди в аккаунт')
  await updateEmail(current, next)
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  if (!auth) throw new Error('Firebase не настроен')
  await signInWithEmailAndPassword(auth, email, password)
}

export async function emailRegisteredFb(email: string): Promise<boolean> {
  if (!auth) return false
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email)
    return methods.length > 0
  } catch {
    return true
  }
}

export async function signOutFb(): Promise<void> {
  if (!auth) return
  await signOut(auth)
}

export async function sendPasswordResetFb(email: string): Promise<void> {
  if (!auth) throw new Error('Firebase не настроен')
  await sendPasswordResetEmail(auth, email)
}

export async function resendVerificationFb(): Promise<void> {
  if (!auth?.currentUser) throw new Error('Сначала войди в аккаунт')
  await sendEmailVerification(auth.currentUser)
}

export async function reloadUserFb(): Promise<boolean> {
  const user = auth?.currentUser
  if (!user) return false
  await reload(user)
  return user.emailVerified
}

export function subscribeAuthFb(callback: (user: FirebaseUser | null) => void): () => void {
  if (!auth) return () => {}
  return onAuthStateChanged(auth, callback)
}

export async function sendPhoneCode(
  phone: string,
  containerId: string,
): Promise<ConfirmationResult> {
  if (!auth) throw new Error('Firebase не настроен')
  const appVerifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' })
  return signInWithPhoneNumber(auth, phone, appVerifier)
}

export async function confirmPhoneCode(
  verificationId: string,
  code: string,
): Promise<FirebaseUser> {
  if (!auth) throw new Error('Firebase не настроен')
  const credential = PhoneAuthProvider.credential(verificationId, code)
  const result = await signInWithCredential(auth, credential)
  return result.user
}

export async function getUserProfileFb(uid: string): Promise<Partial<User>> {
  if (!db) return {}
  try {
    const snapshot = await getDoc(doc(db, 'users', uid))
    if (snapshot.exists()) return snapshot.data() as Partial<User>
  } catch {
    // ignore
  }
  return {}
}

export async function saveUserProfileFb(uid: string, profile: ProfilePatch): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'users', uid), buildPatch(profile), { merge: true })
}

function onSnapshotSafe(
  q: Query<DocumentData>,
  callback: (snapshot: QuerySnapshot<DocumentData>) => void,
): () => void {
  return onSnapshot(
    q,
    (snapshot) => callback(snapshot),
    (error) => {
      console.error('[missing] Firestore подписка не работает:', error)
    },
  )
}

export function subscribeTeamsFb(callback: (teams: CustomTeam[]) => void): () => void {
  if (!db) return () => {}
  const q = query(
    collection(db, 'teams'),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshotSafe(q, (snapshot) => {
    callback(
      snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as CustomTeam),
    )
  })
}

export function subscribeCategoriesFb(callback: (categories: CustomCategory[]) => void): () => void {
  if (!db) return () => {}
  const q = query(
    collection(db, 'categories'),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'asc'),
  )
  return onSnapshotSafe(q, (snapshot) => {
    callback(
      snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as CustomCategory),
    )
  })
}

export function subscribePendingTeamsFb(callback: (teams: CustomTeam[]) => void): () => void {
  if (!db) return () => {}
  const q = query(
    collection(db, 'teams'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshotSafe(q, (snapshot) => {
    callback(
      snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as CustomTeam),
    )
  })
}

export function subscribePendingCategoriesFb(
  callback: (categories: CustomCategory[]) => void,
): () => void {
  if (!db) return () => {}
  const q = query(
    collection(db, 'categories'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'asc'),
  )
  return onSnapshotSafe(q, (snapshot) => {
    callback(
      snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as CustomCategory),
    )
  })
}

export async function setTeamStatusFb(id: string, status: ModerationStatus): Promise<void> {
  if (!db) return
  await updateDoc(doc(db, 'teams', id), { status })
}

export async function updateTeamMembersFb(id: string, members: number): Promise<void> {
  if (!db) return
  await updateDoc(doc(db, 'teams', id), { members })
}

async function deleteChatFb(chatId: string): Promise<void> {
  if (!db) return
  const messages = await getDocs(collection(db, 'chats', chatId, 'messages'))
  const batch = writeBatch(db)
  messages.docs.forEach((docSnap) => batch.delete(docSnap.ref))
  await batch.commit()
  await deleteDoc(doc(db, 'chats', chatId))
}

export async function deleteTeamFb(id: string): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, 'teams', id))
  try {
    const applications = await getDocs(
      query(collection(db, 'applications'), where('teamId', '==', id)),
    )
    const batch = writeBatch(db)
    applications.docs.forEach((docSnap) => batch.delete(docSnap.ref))
    await batch.commit()
  } catch (error) {
    console.error('[missing] Не удалось удалить заявки команды:', error)
  }
  try {
    await deleteChatFb(`team:${id}`)
  } catch (error) {
    console.error('[missing] Не удалось удалить чат команды:', error)
  }
}

export async function deleteCategoryFb(id: string): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, 'categories', id))
  try {
    const teams = await getDocs(query(collection(db, 'teams'), where('sphereId', '==', id)))
    for (const team of teams.docs) {
      try {
        await deleteDoc(team.ref)
      } catch (error) {
        console.error('[missing] Не удалось удалить команду сферы:', error)
      }
      try {
        const applications = await getDocs(
          query(collection(db, 'applications'), where('teamId', '==', team.id)),
        )
        for (const application of applications.docs) await deleteDoc(application.ref)
      } catch (error) {
        console.error('[missing] Не удалось удалить заявки команды сферы:', error)
      }
      try {
        await deleteChatFb(`team:${team.id}`)
      } catch (error) {
        console.error('[missing] Не удалось удалить чат команды сферы:', error)
      }
    }
  } catch (error) {
    console.error('[missing] Не удалось удалить команды сферы:', error)
  }
  try {
    await deleteChatFb(id)
  } catch (error) {
    console.error('[missing] Не удалось удалить чат сферы:', error)
  }
}

export async function setCategoryStatusFb(id: string, status: ModerationStatus): Promise<void> {
  if (!db) return
  await updateDoc(doc(db, 'categories', id), { status })
}

export async function addTeamFb(team: CustomTeam): Promise<void> {
  if (!db) return
  const { id: _id, ...data } = team
  const cleaned = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  )
  await addDoc(collection(db, 'teams'), cleaned)
}

export async function addCategoryFb(category: CustomCategory): Promise<string> {
  if (!db) throw new Error('Firebase не настроен')
  const { id: _id, ...data } = category
  const ref = await addDoc(collection(db, 'categories'), data)
  return ref.id
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
    reader.readAsDataURL(file)
  })
}

async function compressImageFile(file: File): Promise<{ blob: Blob; dataUrl: string }> {
  const dataUrl = await readAsDataUrl(file)
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Не удалось прочитать изображение'))
    image.src = dataUrl
  })
  const max = 700
  const scale = Math.min(1, max / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(img.width * scale))
  canvas.height = Math.max(1, Math.round(img.height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Не удалось обработать изображение')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  const compressed = canvas.toDataURL('image/jpeg', 0.72)
  try {
    const response = await fetch(compressed)
    return { blob: await response.blob(), dataUrl: compressed }
  } catch {
    return { blob: file, dataUrl: compressed }
  }
}

function sanitizeStorageName(name: string): string {
  const cleaned = name.replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
  return cleaned || 'team'
}

export async function uploadCover(file: File, name: string): Promise<string> {
  let result: { blob: Blob; dataUrl: string }
  try {
    result = await compressImageFile(file)
  } catch (error) {
    console.error('[missing] Не удалось сжать изображение, сохраняю оригинал:', error)
    result = { blob: file, dataUrl: await readAsDataUrl(file) }
  }
  if (storage) {
    try {
      const fileRef = ref(storage, `covers/${sanitizeStorageName(name)}-${Date.now()}.jpg`)
      await uploadBytes(fileRef, result.blob)
      return getDownloadURL(fileRef)
    } catch (error) {
      console.error('[missing] Не удалось загрузить в хранилище, сохраняю встроенное изображение:', error)
      return result.dataUrl
    }
  }
  return result.dataUrl
}

export function fbErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  if (message.includes('invalid-email')) return 'Некорректный email'
  if (message.includes('email-already-in-use')) return 'Этот email уже зарегистрирован'
  if (message.includes('weak-password')) return 'Пароль слишком короткий (минимум 6 символов)'
  if (message.includes('invalid-verification-code')) return 'Неверный код подтверждения'
  if (message.includes('invalid-phone-number')) return 'Некорректный номер телефона'
  if (message.includes('wrong-password')) return 'Неверный пароль'
  if (message.includes('user-not-found'))
    return 'Такого аккаунта нет. Сначала зарегистрируйся'
  if (message.includes('too-many-requests')) return 'Слишком много попыток. Попробуй позже'
  if (message.includes('captcha')) return 'Не удалось пройти проверку. Попробуй ещё раз'
  return 'Что-то пошло не так. Попробуй ещё раз'
}

type ChatMeta = {
  kind: 'sphere' | 'team' | 'dm'
  participants?: string[]
  updatedAt?: string
}

export function ensureChatFb(chatId: string, meta: ChatMeta): void {
  if (!db) return
  const ref = doc(db, 'chats', chatId)
  void setDoc(
    ref,
    {
      kind: meta.kind,
      updatedAt: new Date().toISOString(),
      ...(meta.participants ? { participants: meta.participants } : {}),
    },
    { merge: true },
  )
}

export function sendMessageFb(chatId: string, message: ChatMessage): void {
  if (!db) return
  void setDoc(doc(db, 'chats', chatId, 'messages', message.id), {
    authorId: message.userId ?? '',
    authorName: message.authorName,
    text: message.text,
    createdAt: message.createdAt,
  })
}

export function editMessageFb(chatId: string, messageId: string, text: string): void {
  if (!db) return
  void updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
    text,
    edited: true,
    editedAt: new Date().toISOString(),
  })
}

export function deleteMessageFb(chatId: string, messageId: string): void {
  if (!db) return
  void deleteDoc(doc(db, 'chats', chatId, 'messages', messageId))
}

export function subscribeChatMessagesFb(
  chatId: string,
  callback: (messages: ChatMessage[]) => void,
): () => void {
  if (!db) return () => {}
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc'),
  )
  return onSnapshot(
    q,
    (snapshot) => {
      callback(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data()
          return {
            id: docSnap.id,
            userId: data.authorId ?? '',
            authorName: data.authorName ?? 'Пользователь',
            text: data.text ?? '',
            createdAt: data.createdAt ?? new Date().toISOString(),
            edited: data.edited === true,
            editedAt: data.editedAt ?? undefined,
          }
        }),
      )
    },
    (error) => {
      console.error('[missing] Чат недоступен:', error)
    },
  )
}

export function subscribeParticipantChatsFb(
  userId: string,
  callback: (chatIds: string[]) => void,
): () => void {
  if (!db) return () => {}
  const q = query(collection(db, 'chats'), where('participants', 'array-contains', userId))
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((docSnap) => docSnap.id))
    },
    (error) => {
      console.error('[missing] Чаты недоступны:', error)
    },
  )
}

function sanitize(data: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined))
}

export async function addApplicationFb(application: Application): Promise<void> {
  if (!db) return
  const { id, ...data } = application
  await setDoc(doc(db, 'applications', id), sanitize({ ...data }))
}

export async function setApplicationStatusFb(
  id: string,
  status: 'accepted' | 'rejected',
): Promise<void> {
  if (!db) return
  await updateDoc(doc(db, 'applications', id), { status })
}

export function subscribeApplicationsFb(
  userId: string,
  callback: (applications: Application[]) => void,
): () => void {
  if (!db) return () => {}
  const buffer = new Map<string, Application>()
  const emit = () => {
    callback(
      Array.from(buffer.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    )
  }
  const attach = (q: ReturnType<typeof query>) =>
    onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            buffer.delete(change.doc.id)
          } else {
            buffer.set(
              change.doc.id,
              {
                id: change.doc.id,
                ...(change.doc.data() as Record<string, unknown>),
              } as Application,
            )
          }
        })
        emit()
      },
      (error) => {
        console.error('[missing] Заявки недоступны:', error)
      },
    )
  const unsubs: (() => void)[] = []
  unsubs.push(
    attach(
      query(
        collection(db, 'applications'),
        where('userId', '==', userId),
      ),
    ),
  )
  unsubs.push(
    attach(
      query(
        collection(db, 'applications'),
        where('creatorId', '==', userId),
      ),
    ),
  )
  return () => unsubs.forEach((unsubscribe) => unsubscribe())
}

export function addNotificationFb(notification: Notification): void {
  if (!db) return
  void setDoc(doc(db, 'notifications', notification.id), sanitize({ ...notification }))
}

export function subscribeNotificationsFb(
  userId: string,
  callback: (notifications: Notification[]) => void,
): () => void {
  if (!db) return () => {}
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
  )
  return onSnapshot(
    q,
    (snapshot) => {
      callback(
        snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Notification)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      )
    },
    (error) => {
      console.error('[missing] Уведомления недоступны:', error)
    },
  )
}

export async function markNotificationsReadFb(userId: string): Promise<void> {
  if (!db) return
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
  )
  const snapshot = await getDocs(q)
  const batch = writeBatch(db)
  snapshot.docs.forEach((docSnap) => {
    if (docSnap.data().read !== true) {
      batch.update(docSnap.ref, { read: true })
    }
  })
  await batch.commit()
}