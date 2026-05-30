import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Welcome from './pages/Welcome'
import Browse from './pages/Browse'
import Matches from './pages/Matches'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import Verify from './pages/Verify'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
    }

    const tgUser = tg?.initDataUnsafe?.user

    if (tgUser) {
      loginWithTelegram(tgUser)
    } else {
      // Browser/demo mode — check localStorage
      const saved = localStorage.getItem('habesha_demo_profile')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // Only use saved profile if it has real data
          if (parsed && parsed.name && parsed.name !== 'Demo User') {
            setUser(parsed)
          } else {
            // Stale/empty demo — start fresh
            localStorage.removeItem('habesha_demo_profile')
            setUser({ id: 'demo-user', name: 'Demo User', telegram_id: 12345, profile_complete: false })
          }
        } catch {
          setUser({ id: 'demo-user', name: 'Demo User', telegram_id: 12345, profile_complete: false })
        }
      } else {
        setUser({ id: 'demo-user', name: 'Demo User', telegram_id: 12345, profile_complete: false })
      }
      setLoading(false)
    }
  }, [])

  const loginWithTelegram = async (tgUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', tgUser.id)
        .single()

      if (error || !data) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            telegram_id: tgUser.id,
            name: `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
            photo_url: tgUser.photo_url || null,
            profile_complete: false,
          })
          .select()
          .single()

        if (insertError) throw insertError
        setUser(newProfile)
      } else {
        setUser(data)
      }
    } catch (e) {
      console.error('Telegram login error:', e)
      setUser({ id: 'demo-user', name: 'Demo User', telegram_id: 12345, profile_complete: false })
    }
    setLoading(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 48, background: '#FDF6EC' }}>
      💛
    </div>
  )

  // A profile is complete only if profile_complete is explicitly true
  const profileComplete = user?.profile_complete === true

  return (
    <Routes>
      <Route
        path="/"
        element={!profileComplete
          ? <Welcome user={user} setUser={setUser} />
          : <Navigate to="/browse" />}
      />
      <Route path="/browse" element={profileComplete ? <Browse user={user} /> : <Navigate to="/" />} />
      <Route path="/matches" element={profileComplete ? <Matches user={user} /> : <Navigate to="/" />} />
      <Route path="/chat/:matchId" element={<Chat user={user} />} />
      <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
      <Route path="/verify" element={<Verify user={user} setUser={setUser} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
