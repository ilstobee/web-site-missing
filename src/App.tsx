import { register } from './store'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { CategoryGrid } from './components/CategoryGrid'
import { FeaturedTeams } from './components/FeaturedTeams'
import { CreateBanner } from './components/CreateBanner'
import { RecommendedTeams } from './components/RecommendedTeams'
import { StatsBar } from './components/StatsBar'
import { Footer } from './components/Footer'
import { AuthModal } from './components/AuthModal'
import { ApplyModal } from './components/ApplyModal'

export default function App() {
  const [isAuthOpen, setIsAuthOpen] = React.useState(false)
  const [isLKOpen, setIsLKOpen] = React.useState(false)
  const [isApplyOpen, setIsApplyOpen] = React.useState(false)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  const authOpen = () => setIsAuthOpen(true)
  const closeAuth = () => setIsAuthOpen(false)
  const lkOpen = () => setIsLKOpen(true)
  const closeLK = () => setIsLKOpen(false)
  const closeApply = () => setIsApplyOpen(false)
  const createOpen = () => setIsCreateOpen(true)
  const closeCreate = () => setIsCreateOpen(false)

  return (
    <div id="top" className="min-h-svh wave-top">
      <div className="wave-strip" aria-hidden />
      <AppProvider>
        <Header
          onOpenAuth={authOpen}
          onOpenLK={lkOpen}
          onOpenChat={() => {}}
        />
        <main>
          <Hero />
          <CategoryGrid
            activeId="travel"
            onActiveChange={(id) => {}}
            onOpenAuth={authOpen}
          />
          <FeaturedTeams onOpenAuth={authOpen} />
          <CreateBanner onOpenAuth={authOpen} />
          <RecommendedTeams />
          <StatsBar />
        </main>
        <Footer />
        <AuthModal open={isAuthOpen} onClose={closeAuth} onSuccess={closeLK} />
        <ApplyModal onClose={closeApply} />
      </AppProvider>
    </div>
  )
}
