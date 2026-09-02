import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useApp } from './store'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { CategoryGrid } from './components/CategoryGrid'
import { FeaturedTeams } from './components/FeaturedTeams'
import { CreateBanner } from './components/CreateBanner'
import { RecommendedTeams } from './components/RecommendedTeams'
import { QuickMatch } from './components/QuickMatch'
import { StatsBar } from './components/StatsBar'
import { LoadingScreen } from './components/LoadingScreen'
import { Footer } from './components/Footer'
import { AuthModal } from './components/AuthModal'
import { ProfileModal } from './components/ProfileModal'
const ChatModal = lazy(() =>
  import('./components/ChatModal').then((m) => ({ default: m.ChatModal })),
)
const UserProfileModal = lazy(() =>
  import('./components/UserProfileModal').then((m) => ({ default: m.UserProfileModal })),
)
import { VerifyBanner } from './components/VerifyBanner'

export default function App() {
  const { user, emailVerified, db } = useApp()
  const [authOpen, setAuthOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInitialId, setChatInitialId] = useState<string | undefined>(undefined)
  const [profileInitialTab, setProfileInitialTab] = useState<
    'profile' | 'applications' | 'incoming'
  >('profile')
  const [activeSphere, setActiveSphere] = useState('travel')
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState<string>(() => {
    try {
      return localStorage.getItem('missing_city') || 'all'
    } catch {
      return 'all'
    }
  })
  const changeCity = (next: string) => {
    setCity(next)
    try {
      localStorage.setItem('missing_city', next)
    } catch {
      // ignore
    }
  }
  const cityOptions = useMemo(() => {
    const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').replace(/–|—/g, '-')
    const seen = new Set<string>()
    const list: string[] = []
    const add = (value: string) => {
      const city = normalize(value)
      if (!city) return
      const key = city.toLowerCase()
      if (seen.has(key)) return
      seen.add(key)
      list.push(city)
    }
    ;[
      'Москва',
      'Санкт-Петербург',
      'Казань',
      'Нижний Новгород',
      'Екатеринбург',
      'Краснодар',
      'Самара',
      'Новосибирск',
      'Ростов-на-Дону',
      'Йошкар-Ола',
    ].forEach(add)
    db.customTeams.forEach((team) => {
      if (team.city) add(team.city)
    })
    return list.sort((a, b) => a.localeCompare(b, 'ru'))
  }, [db.customTeams])
  const openAuth = () => setAuthOpen(true)
  const closeAuth = () => setAuthOpen(false)
  const openProfile = () => {
    if (!user) {
      setAuthOpen(true)
      return
    }
    setProfileInitialTab('profile')
    setProfileOpen(true)
  }
  const openApplications = () => {
    if (!user) {
      setAuthOpen(true)
      return
    }
    setProfileInitialTab('applications')
    setProfileOpen(true)
  }
  const openIncoming = () => {
    if (!user) {
      setAuthOpen(true)
      return
    }
    setProfileInitialTab('incoming')
    setProfileOpen(true)
  }
  const closeProfile = () => setProfileOpen(false)
  const [profileUserId, setProfileUserId] = useState<string | null>(null)
  const openUserProfile = (uid: string) => setProfileUserId(uid)
  const closeUserProfile = () => setProfileUserId(null)
  const openChat = (chatId?: string) => {
    setChatInitialId(chatId)
    setChatOpen(true)
  }
  const openHeaderChat = () => openChat()
  const closeChat = () => setChatOpen(false)

  const handleSphereChange = (id: string) => {
    setActiveSphere(id)
  }

  useEffect(() => {
    if (loading) return
    const sections = Array.from(document.querySelectorAll<HTMLElement>('#top > main > *'))
    if (!('IntersectionObserver' in window)) {
      sections.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          } else {
            entry.target.classList.remove('is-visible')
          }
        }
      },
      { threshold: 0.12 },
    )
    sections.forEach((el) => {
      el.classList.add('reveal')
      observer.observe(el)
    })
    return () => observer.disconnect()
  }, [loading])

  if (loading) {
    return <LoadingScreen onDone={() => setLoading(false)} />
  }

  return (
    <div id="top" className="min-h-svh wave-top">
      <Header onOpenAuth={openAuth} onOpenLK={openProfile} onOpenApplications={openApplications} onOpenIncoming={openIncoming} onOpenChat={openHeaderChat} />
      {user && !emailVerified ? <VerifyBanner /> : null}
      <main>
        <Hero city={city} cityOptions={cityOptions} onCityChange={changeCity} />
        <QuickMatch city={city} onOpenAuth={openAuth} onOpenChat={openChat} />
        <CategoryGrid
          activeId={activeSphere}
          onActiveChange={handleSphereChange}
          onOpenAuth={openAuth}
          onOpenChat={openChat}
        />
        <FeaturedTeams city={city} onOpenAuth={openAuth} onOpenChat={openChat} />
        <CreateBanner onOpenAuth={openAuth} />
        <RecommendedTeams city={city} onOpenChat={openChat} />
        <StatsBar />
      </main>
      <Footer />
      <AuthModal open={authOpen} onClose={closeAuth} onSuccess={closeAuth} />
      <ProfileModal open={profileOpen} onClose={closeProfile} initialTab={profileInitialTab} onOpenChat={openChat} />
      <Suspense fallback={null}>
        <ChatModal open={chatOpen} onClose={closeChat} initialChatId={chatInitialId} onOpenProfile={openUserProfile} />
        <UserProfileModal userId={profileUserId} onClose={closeUserProfile} onOpenChat={openChat} />
      </Suspense>
    </div>
  )
}
