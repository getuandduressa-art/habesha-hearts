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
      const saved = localStorage.getItem('habesha_demo_profile')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setUser(parsed)
        } catch {
          setUser({ id: 'demo-user', name: 'Demo User', telegram_id: 12345 })
        }
      } else {
        setUser({ id: 'demo-user', name: 'Demo User', telegram_id: 12345 })
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
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            telegram_id: tgUser.id,
            name: `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
            photo_url: tgUser.photo_url || null,
            profile_complete: false,
          })
          .select()
          .single()
        setUser(newProfile)
      } else {
        setUser(data)
      }
    } catch (e) {
      console.error(e)
      setUser({ id: 'demo-user', name: 'Demo User', telegram_id: 12345 })
    }
    setLoading(false)
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontSize:48,background:'#FDF6EC'}}>
      💛
    </div>
  )

  const profileComplete = user?.profile_complete === true ||
    (user?.age && user?.region && user?.religion)

  return (
    <Routes>
      <Route path="/" element={!profileComplete
        ? <Welcome user={user} setUser={setUser} />
        : <Navigate to="/browse" />}
      />
      <Route path="/browse" element={<Browse user={user} />} />
      <Route path="/matches" element={<Matches user={user} />} />
      <Route path="/chat/:matchId" element={<Chat user={user} />} />
      <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
      <Route path="/verify" element={<Verify user={user} setUser={setUser} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
