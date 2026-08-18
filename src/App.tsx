import { useState } from 'react'
import { useApp } from './store'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { CategoryGrid } from './components/CategoryGrid'
import { FeaturedTeams } from './components/FeaturedTeams'
import { CreateBanner } from './components/CreateBanner'
import { RecommendedTeams } from './components/RecommendedTeams'
import { StatsBar } from './components/StatsBar'
import { Footer } from './components/Footer'
import { AuthModal } from './components/AuthModal'
import { ProfileModal } from './components/ProfileModal'

export default function App() {
  const { recordVisit, user } = useApp()
  const [authOpen, setAuthOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileInitialTab, setProfileInitialTab] = useState<'profile' | 'applications'>('profile')
  const [activeSphere, setActiveSphere] = useState('travel')
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

  const handleSphereChange = (id: string) => {
    setActiveSphere(id)
    recordVisit(id)
  }

  return (
    <div id="top" className="min-h-svh wave-top">
      <div className="wave-strip" aria-hidden />
      <Header onOpenAuth={openAuth} onOpenLK={openProfile} onOpenApplications={openApplications} onOpenChat={() => {}} />
      <main>
        <Hero />
        <CategoryGrid
          activeId={activeSphere}
          onActiveChange={handleSphereChange}
          onOpenAuth={openAuth}
        />
        <FeaturedTeams onOpenAuth={openAuth} />
        <CreateBanner onOpenAuth={openAuth} />
        <RecommendedTeams />
        <StatsBar />
      </main>
      <Footer />
      <AuthModal open={authOpen} onClose={closeAuth} onSuccess={closeAuth} />
      <ProfileModal open={profileOpen} onClose={closeProfile} initialTab={profileInitialTab} />
    </div>
  )
}
