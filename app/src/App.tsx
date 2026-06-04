import { greeting } from '@/greeting'
import CryptoDashboard from '@/components/CryptoDashboard'

export default function App() {
  return (
    <main style={{ fontFamily: 'system-ui', padding: '2rem' }}>
      <h1 style={{ marginBottom: '0.25rem' }}>{greeting('webapp')}</h1>
      <p style={{ marginTop: 0, color: '#6b7280' }}>Top cryptocurrencies by market cap</p>
      <CryptoDashboard />
    </main>
  )
}
