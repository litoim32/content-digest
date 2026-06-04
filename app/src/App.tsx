import { greeting } from '@/greeting'

export default function App() {
  return (
    <main style={{ fontFamily: 'system-ui', padding: '2rem' }}>
      <h1>{greeting('webapp')}</h1>
      <p>A general-purpose internal web tool for the team — quick notes and useful links.</p>
    </main>
  )
}
