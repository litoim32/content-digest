import { greeting } from '@/greeting'
import CryptoDashboard from '@/components/CryptoDashboard'
import './App.css'

export default function App() {
  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">
          <span className="app__rocket">🚀</span> {greeting('webapp')}
        </h1>
        <p className="app__tagline">Top cryptocurrencies by market cap ✨</p>
      </header>
      <CryptoDashboard />
    </main>
  )
}
