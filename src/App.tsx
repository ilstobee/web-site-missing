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

export default function App() {
  const { recordVisit } = useApp()
  const [authOpen, setAuthOpen] = useState(false)
  const [activeSphere, setActiveSphere] = useState('travel')
  const openAuth = () => setAuthOpen(true)
  const closeAuth = () => setAuthOpen(false)

  const handleSphereChange = (id: string) => {
    setActiveSphere(id)
    recordVisit(id)
  }

  return (
    <div id="top" className="min-h-svh wave-top">
      <div className="wave-strip" aria-hidden />
      <Header
        onOpenAuth={openAuth}
        onOpenLK={() => {}}
        onOpenChat={() => {}}
      />
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
      <AuthModal open={authOpen} onClose={closeAuth} onSuccess={() => {}} />
    </div>
  )
}
