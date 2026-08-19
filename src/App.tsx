import { useEffect, useState } from 'react'
import { useApp } from './store'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { CategoryGrid } from './components/CategoryGrid'
import { FeaturedTeams } from './components/FeaturedTeams'
import { CreateBanner } from './components/CreateBanner'
import { RecommendedTeams } from './components/RecommendedTeams'
import { StatsBar } from './components/StatsBar'
import { LoadingScreen } from './components/LoadingScreen'
import { Footer } from './components/Footer'
import { AuthModal } from './components/AuthModal'
import { ProfileModal } from './components/ProfileModal'
import { ChatModal } from './components/ChatModal'
import { VerifyBanner } from './components/VerifyBanner'

export default function App() {
  const { recordVisit, user, emailVerified } = useApp()
  const [authOpen, setAuthOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInitialId, setChatInitialId] = useState<string | undefined>(undefined)
  const [profileInitialTab, setProfileInitialTab] = useState<'profile' | 'applications'>('profile')
  const [activeSphere, setActiveSphere] = useState('travel')
  const [loading, setLoading] = useState(true)
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
  const closeProfile = () => setProfileOpen(false)
  const openChat = (chatId?: string) => {
    setChatInitialId(chatId)
    setChatOpen(true)
  }
  const openHeaderChat = () => openChat()
  const closeChat = () => setChatOpen(false)

  const handleSphereChange = (id: string) => {
    setActiveSphere(id)
    recordVisit(id)
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
      <Header onOpenAuth={openAuth} onOpenLK={openProfile} onOpenApplications={openApplications} onOpenChat={openHeaderChat} />
      {user && !emailVerified ? <VerifyBanner /> : null}
      <main>
        <Hero />
        <CategoryGrid
          activeId={activeSphere}
          onActiveChange={handleSphereChange}
          onOpenAuth={openAuth}
          onOpenChat={openChat}
        />
        <FeaturedTeams onOpenAuth={openAuth} onOpenChat={openChat} />
        <CreateBanner onOpenAuth={openAuth} />
        <RecommendedTeams onOpenChat={openChat} />
        <StatsBar />
      </main>
      <Footer />
      <AuthModal open={authOpen} onClose={closeAuth} onSuccess={closeAuth} />
      <ProfileModal open={profileOpen} onClose={closeProfile} initialTab={profileInitialTab} onOpenChat={openChat} />
      <ChatModal open={chatOpen} onClose={closeChat} initialChatId={chatInitialId} />
    </div>
  )
}
