import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
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
  onSnapshot,
  query,
  orderBy,
  type Firestore,
} from 'firebase/firestore'
import type { CustomCategory, CustomTeam, User, UserRole } from './store'

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

export type ProfilePatch = {
  name?: string
  surname?: string
  city?: string
  telegram?: string
  hobbies?: string[]
  role?: UserRole
  login?: string
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
  const q = query(collection(db, 'teams'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as CustomTeam),
    )
  })
}

export function subscribeCategoriesFb(callback: (categories: CustomCategory[]) => void): () => void {
  if (!db) return () => {}
  const q = query(collection(db, 'categories'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as CustomCategory),
    )
  })
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