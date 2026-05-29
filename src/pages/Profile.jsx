import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import NavBar from '../components/NavBar'
import Avatar from '../components/Avatar'
import VerifyBadge from '../components/VerifyBadge'

const REGIONS = ['Addis Ababa','Oromia','Amhara','Tigray','SNNPR','Harari','Dire Dawa']
const RELIGIONS = ['Orthodox Christian','Muslim','Protestant','Catholic','Other']
const INTERESTS = ['🎵 Music','⚽ Sports','💼 Business','🎨 Art','💻 Tech','🕊️ Faith','🍜 Food','✈️ Travel','🏺 Culture','📚 Learning']

export default function Profile({ user, setUser }) {
  const [form, setForm] = useState({ name:'', age:'', region:'', religion:'', vibe:'Modern', bio:'' })
  const [interests, setInterests] = useState([])
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    if (user) {
      setForm({ name:user.name||'', age:user.age||'', region:user.region||'', religion:user.religion||'', vibe:user.vibe||'Modern', bio:user.bio||'' })
      setInterests(user.interests || [])
    }
  }, [user])

  const toggleInterest = (i) => setInterests(p => p.includes(i) ? p.filter(x=>x!==i) : [...p,i])

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const save = async () => {
    setSaving(true)
    let photo_url = user?.photo_url
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${user.id}.${ext}`
      await supabase.storage.from('avatars').upload(path, photoFile, { upsert: true })
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      photo_url = publicUrl
    }
    const updates = { name:form.name, age:parseInt(form.age), region:form.region, religion:form.religion, vibe:form.vibe, bio:form.bio, photo_url, interests }
    await supabase.from('profiles').update(updates).eq('id', user.id)
    setUser(prev => ({ ...prev, ...updates }))
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const C = {
    page: {minHeight:'100vh',paddingBottom:70,position:'relative',zIndex:1},
    header: {background:'#fff',borderBottom:'1px solid #FFD0DD',padding:'16px 20px',position:'sticky',top:0,zIndex:10,boxShadow:'0 2px 12px rgba(194,59,94,0.06)'},
    title: {fontSize:18,fontWeight:800,color:'#C23B5E'},
    body: {padding:20,display:'flex',flexDirection:'column',gap:14},
    label: {display:'block',fontSize:'0.7rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:'#B84C6E',marginBottom:'0.4rem'},
    input: {width:'100%',padding:'12px 16px',borderRadius:14,border:'1px solid #FFD0DD',background:'#FFF8FA',color:'#2C1810',fontSize:15,outline:'none'},
    select: {width:'100%',padding:'12px 16px',borderRadius:14,border:'1px solid #FFD0DD',background:'#FFF8FA',color:'#2C1810',fontSize:15,outline:'none'},
    row2: {display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'},
    vibeToggle: {display:'flex',gap:'0.75rem',background:'#FFF8FA',padding:'0.3rem',borderRadius:'3rem',border:'1px solid #FFD0DD'},
    vibeBtn: (active) => ({flex:1,background:active?'#E86F8C':'transparent',border:'none',padding:'0.5rem 0',borderRadius:'2rem',fontWeight:600,fontSize:'0.8rem',color:active?'#fff':'#B84C6E',cursor:'pointer'}),
    tag: (active) => ({background:active?'#E86F8C':'#FFF8FA',border:`1px solid ${active?'#E86F8C':'#FFD0DD'}`,borderRadius:'2rem',padding:'0.35rem 0.9rem',fontSize:'0.75rem',fontWeight:500,color:active?'#fff':'#2C1810',cursor:'pointer',display:'inline-block',margin:'0 0.3rem 0.4rem 0'}),
    photoArea: {border:'2px dashed #FFD0DD',borderRadius:'1rem',padding:'0.8rem',textAlign:'center',cursor:'pointer',color:'#B84C6E',fontSize:'0.85rem'},
    saveBtn: {background:'#E86F8C',color:'#fff',border:'none',borderRadius:16,padding:14,fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(232,111,140,0.3)'},
    verifyBtn: {background:'none',border:'1.5px solid #E86F8C',borderRadius:16,padding:12,fontSize:14,color:'#E86F8C',fontWeight:600,cursor:'pointer'},
  }

  return (
    <div style={C.page}>
      <div style={C.header}>
        <h1 style={C.title}>👤 My Profile</h1>
      </div>

      <div style={C.body}>
        {/* Avatar */}
        <div style={{textAlign:'center',padding:'10px 0 6px'}}>
          <Avatar name={form.name} photoUrl={photoPreview || user?.photo_url} size={84} />
          <div style={{marginTop:10}}>
            <VerifyBadge photo={user?.photo_verified} id={user?.id_verified} />
          </div>
          <label style={{display:'inline-block',marginTop:10,fontSize:13,color:'#E86F8C',cursor:'pointer',padding:'6px 16px',border:'1px solid #E86F8C',borderRadius:20}}>
            📷 Change Photo
            <input type="file" accept="image/*" onChange={handlePhoto} style={{display:'none'}} />
          </label>
        </div>

        <div style={{height:'1px',background:'linear-gradient(90deg,transparent,#FFD0DD,transparent)'}} />

        <div style={C.row2}>
          <div>
            <label style={C.label}>Name</label>
            <input style={C.input} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Full name" />
          </div>
          <div>
            <label style={C.label}>Age</label>
            <input style={C.input} value={form.age} onChange={e=>setForm(p=>({...p,age:e.target.value}))} placeholder="18+" type="number" min={18} max={60} />
          </div>
        </div>

        <div style={C.row2}>
          <div>
            <label style={C.label}>Region</label>
            <select style={C.select} value={form.region} onChange={e=>setForm(p=>({...p,region:e.target.value}))}>
              <option value="">Select</option>
              {REGIONS.map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={C.label}>Religion</label>
            <select style={C.select} value={form.religion} onChange={e=>setForm(p=>({...p,religion:e.target.value}))}>
              <option value="">Select</option>
              {RELIGIONS.map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={C.label}>Vibe</label>
          <div style={C.vibeToggle}>
            {['Traditional','Modern'].map(v=>(
              <button key={v} style={C.vibeBtn(form.vibe===v)} onClick={()=>setForm(p=>({...p,vibe:v}))}>
                {v==='Traditional'?'🌿 Traditional':'✨ Modern'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={C.label}>Bio / መግለጫ</label>
          <textarea value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))}
            placeholder="Write something about yourself..." rows={3}
            style={{...C.input,resize:'none'}} />
        </div>

        <div>
          <label style={C.label}>Interests</label>
          <div>
            {INTERESTS.map(i=>(
              <span key={i} style={C.tag(interests.includes(i))} onClick={()=>toggleInterest(i)}>{i}</span>
            ))}
          </div>
        </div>

        <button onClick={save} disabled={saving} style={C.saveBtn}>
          {saving?'Saving...':saved?'✓ Saved!':'Save Profile'}
        </button>

        <button onClick={()=>nav('/verify')} style={C.verifyBtn}>
          🛡 Get Verified / ተረጋግጥ
        </button>
      </div>
      <NavBar active="profile" />
    </div>
  )
}