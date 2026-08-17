import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { CategoryGrid } from './components/CategoryGrid'
import { FeaturedTeams } from './components/FeaturedTeams'
import { CreateBanner } from './components/CreateBanner'
import { RecommendedTeams } from './components/RecommendedTeams'
import { StatsBar } from './components/StatsBar'
import { Footer } from './components/Footer'

export default function App() {
  return (
    <div id="top" className="min-h-svh wave-top">
      <div className="wave-strip" aria-hidden />
      <Header />
      <main>
        <Hero />
        <CategoryGrid />
        <FeaturedTeams />
        <CreateBanner />
        <RecommendedTeams />
        <StatsBar />
      </main>
      <Footer />
    </div>
  )
}
