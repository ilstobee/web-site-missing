import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  reload,
  updatePassword,
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
  type Firestore,
} from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from 'firebase/storage'
import type { CustomCategory, CustomTeam, ModerationStatus, User, UserRole } from './store'

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

export async function signInWithEmail(email: string, password: string): Promise<void> {
  if (!auth) throw new Error('Firebase не настроен')
  await signInWithEmailAndPassword(auth, email, password)
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

export function subscribeTeamsFb(callback: (teams: CustomTeam[]) => void): () => void {
  if (!db) return () => {}
  const q = query(
    collection(db, 'teams'),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(q, (snapshot) => {
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
  return onSnapshot(q, (snapshot) => {
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
  return onSnapshot(q, (snapshot) => {
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
  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as CustomCategory),
    )
  })
}

export async function setTeamStatusFb(id: string, status: ModerationStatus): Promise<void> {
  if (!db) return
  await updateDoc(doc(db, 'teams', id), { status })
}

export async function setCategoryStatusFb(id: string, status: ModerationStatus): Promise<void> {
  if (!db) return
  await updateDoc(doc(db, 'categories', id), { status })
}

export async function addTeamFb(team: CustomTeam): Promise<void> {
  if (!db) return
  const { id: _id, ...data } = team
  await addDoc(collection(db, 'teams'), data)
}

export async function addCategoryFb(category: CustomCategory): Promise<string> {
  if (!db) throw new Error('Firebase не настроен')
  const { id: _id, ...data } = category
  const ref = await addDoc(collection(db, 'categories'), data)
  return ref.id
}

export async function uploadCover(file: File, name: string): Promise<string> {
  if (storage) {
    const fileRef = ref(storage, `covers/${name}-${Date.now()}`)
    await uploadBytes(fileRef, file)
    return getDownloadURL(fileRef)
  }
  return fileToDataUrl(file)
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const img = new Image()
      img.onload = () => {
        const max = 600
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(dataUrl)
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = () => resolve(dataUrl)
      img.src = dataUrl
    }
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
    reader.readAsDataURL(file)
  })
}

export function fbErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  if (message.includes('invalid-email')) return 'Некорректный email'
  if (message.includes('email-already-in-use')) return 'Этот email уже зарегистрирован'
  if (message.includes('weak-password')) return 'Пароль слишком короткий (минимум 6 символов)'
  if (message.includes('invalid-verification-code')) return 'Неверный код подтверждения'
  if (message.includes('invalid-phone-number')) return 'Некорректный номер телефона'
  if (message.includes('wrong-password')) return 'Неверный пароль'
  if (message.includes('user-not-found')) return 'Пользователь не найден'
  if (message.includes('too-many-requests')) return 'Слишком много попыток. Попробуй позже'
  if (message.includes('captcha')) return 'Не удалось пройти проверку. Попробуй ещё раз'
  return 'Что-то пошло не так. Попробуй ещё раз'
}