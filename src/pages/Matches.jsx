import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import NavBar from '../components/NavBar'
import Avatar from '../components/Avatar'
import VerifyBadge from '../components/VerifyBadge'

export default function Matches({ user }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => { loadMatches() }, [])

  const loadMatches = async () => {
    if (!user) return
    const { data } = await supabase
      .from('matches')
      .select(`id, user1, user2,
        p1:profiles!matches_user1_fkey(id,name,photo_url,photo_verified,id_verified,region),
        p2:profiles!matches_user2_fkey(id,name,photo_url,photo_verified,id_verified,region)
      `)
      .or(`user1.eq.${user.id},user2.eq.${user.id}`)
      .order('created_at', { ascending: false })
    setMatches(data || [])
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',paddingBottom:70,position:'relative',zIndex:1}}>
      {/* Header */}
      <div style={{background:'#fff',borderBottom:'1px solid #FFD0DD',padding:'16px 20px',position:'sticky',top:0,zIndex:10,boxShadow:'0 2px 12px rgba(194,59,94,0.06)'}}>
        <h1 style={{fontSize:20,fontWeight:800,color:'#C23B5E',letterSpacing:-0.3}}>
          💬 Matches {matches.length > 0 && <span style={{fontSize:14,color:'#E86F8C',fontWeight:500}}>· {matches.length}</span>}
        </h1>
      </div>

      <div style={{padding:16}}>
        {loading ? (
          <div style={{textAlign:'center',paddingTop:60,fontSize:36}}>💕</div>
        ) : matches.length === 0 ? (
          <div style={{textAlign:'center',paddingTop:80}}>
            <div style={{fontSize:52}}>💔</div>
            <p style={{color:'#B84C6E',marginTop:12,fontSize:15,fontWeight:500}}>No matches yet.</p>
            <p style={{color:'#B84C6E',fontSize:13,marginTop:4}}>Keep swiping! ቀጥሉ! 💕</p>
            <button onClick={()=>nav('/browse')}
              style={{marginTop:20,background:'#E86F8C',color:'#fff',border:'none',borderRadius:20,padding:'10px 24px',fontSize:14,fontWeight:600,cursor:'pointer'}}>
              Browse Profiles
            </button>
          </div>
        ) : (
          matches.map(m => {
            const other = m.user1 === user?.id ? m.p1 : m.p2
            if (!other) return null
            return (
              <div key={m.id} onClick={()=>nav(`/chat/${m.id}`)}
                style={{background:'#fff',borderRadius:'1.5rem',padding:16,marginBottom:12,border:'1px solid rgba(194,59,94,0.1)',display:'flex',alignItems:'center',gap:12,cursor:'pointer',boxShadow:'0 4px 16px rgba(194,59,94,0.08)',transition:'transform 0.2s'}}>
                <Avatar name={other.name} photoUrl={other.photo_url} size={54} />
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15,color:'#C23B5E'}}>{other.name}</div>
                  <div style={{fontSize:12,color:'#B84C6E',marginTop:2}}>📍 {other.region}</div>
                  <div style={{marginTop:5}}>
                    <VerifyBadge photo={other.photo_verified} id={other.id_verified} />
                  </div>
                </div>
                <div style={{background:'#E86F8C',borderRadius:12,padding:'8px 12px',fontSize:18,color:'#fff'}}>
                  💬
                </div>
              </div>
            )
          })
        )}
      </div>
      <NavBar active="matches" />
    </div>
  )
}