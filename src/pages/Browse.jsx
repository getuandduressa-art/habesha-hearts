import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import NavBar from '../components/NavBar'
import ProfileCard from '../components/ProfileCard'

const REGIONS = ['Addis Ababa','Oromia','Amhara','Tigray','SNNPR','Harari','Dire Dawa']
const RELIGIONS = ['Orthodox Christian','Muslim','Protestant','Catholic','Other']

export default function Browse({ user }) {
  const [profiles, setProfiles] = useState([])
  const [idx, setIdx] = useState(0)
  const [toast, setToast] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({ region:'', religion:'', vibe:'' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadProfiles() }, [filters])

  const loadProfiles = async () => {
    setLoading(true)
    let q = supabase.from('profiles').select('*').neq('id', user?.id).not('age','is',null)
    if (filters.region) q = q.eq('region', filters.region)
    if (filters.religion) q = q.eq('religion', filters.religion)
    if (filters.vibe) q = q.eq('vibe', filters.vibe)
    const { data } = await q.limit(20)
    setProfiles(data || [])
    setIdx(0)
    setLoading(false)
  }

  const handleLike = async () => {
    const p = profiles[idx]
    if (!p || !user) return
    await supabase.from('likes').insert({ from_user: user.id, to_user: p.id })
    const { data: mutual } = await supabase.from('likes').select('id')
      .eq('from_user', p.id).eq('to_user', user.id).maybeSingle()
    if (mutual) showToast(`It's a match with ${p.name}! 💕`)
    setIdx(i => i+1)
  }

  const handlePass = () => setIdx(i => i+1)
  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 3000) }
  const current = profiles[idx]

  return (
    <div style={{minHeight:'100vh',paddingBottom:70,position:'relative',zIndex:1}}>
      {/* Header */}
      <div style={{background:'#fff',borderBottom:'1px solid #FFD0DD',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:10,boxShadow:'0 2px 12px rgba(194,59,94,0.06)'}}>
        <span style={{fontSize:18,fontWeight:800,color:'#C23B5E',letterSpacing:-0.3}}>
          💕 Habesha Hearts
        </span>
        <button onClick={()=>setFilterOpen(f=>!f)}
          style={{background:'#FFF8FA',border:'1px solid #FFD0DD',borderRadius:20,padding:'5px 14px',color:'#E86F8C',fontSize:13,fontWeight:600,cursor:'pointer'}}>
          ⚙ Filter
        </button>
      </div>

      {/* Filters */}
      {filterOpen && (
        <div style={{background:'#FFF8FA',padding:'12px 16px',display:'flex',gap:8,flexWrap:'wrap',borderBottom:'1px solid #FFD0DD'}}>
          {[['region',REGIONS],['religion',RELIGIONS],['vibe',['Traditional','Modern']]].map(([key,opts])=>(
            <select key={key} value={filters[key]} onChange={e=>setFilters(f=>({...f,[key]:e.target.value}))}
              style={{borderRadius:12,padding:'5px 10px',border:'1px solid #FFD0DD',background:'#fff',fontSize:12,color:'#C23B5E',cursor:'pointer',width:'auto'}}>
              <option value="">All {key}s</option>
              {opts.map(o=><option key={o}>{o}</option>)}
            </select>
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{padding:16,minHeight:'calc(100vh - 130px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        {loading ? (
          <div style={{fontSize:40}}>💕</div>
        ) : !current ? (
          <div style={{textAlign:'center',padding:40}}>
            <div style={{fontSize:52}}>🌙</div>
            <p style={{color:'#B84C6E',marginTop:12,fontSize:15,fontWeight:500}}>No more profiles right now.</p>
            <p style={{color:'#B84C6E',fontSize:13,marginTop:4}}>Check back soon! ቀጥሎ ይምጡ!</p>
            <button onClick={loadProfiles}
              style={{marginTop:16,background:'#E86F8C',color:'#fff',border:'none',borderRadius:20,padding:'10px 24px',fontSize:14,fontWeight:600,cursor:'pointer'}}>
              Refresh / አድስ
            </button>
          </div>
        ) : (
          <ProfileCard profile={current} onLike={handleLike} onPass={handlePass} />
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{position:'fixed',bottom:85,left:'50%',transform:'translateX(-50%)',background:'#E86F8C',color:'#fff',padding:'10px 22px',borderRadius:20,fontSize:13,whiteSpace:'nowrap',zIndex:99,boxShadow:'0 4px 16px rgba(232,111,140,0.4)',fontWeight:600}}>
          {toast}
        </div>
      )}
      <NavBar active="browse" />
    </div>
  )
}