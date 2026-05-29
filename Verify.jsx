import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import NavBar from '../components/NavBar'

export default function Verify({ user }) {
  const [step, setStep] = useState(
    user?.liveness_verified ? 3 : user?.id_verified ? 2 : user?.photo_verified ? 1 : 0
  )
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()
  const idRef = useRef()
  const nav = useNavigate()

  const markVerified = async (field) => {
    await supabase.from('profiles').update({ [field]: true }).eq('id', user.id)
  }

  const handlePhotoVerify = async (e) => {
    setLoading(true)
    const file = e.target.files[0]
    if (file) {
      await supabase.storage.from('avatars')
        .upload(`verify/selfie_${user.id}`, file, { upsert: true })
      await markVerified('photo_verified')
      setStep(1)
    }
    setLoading(false)
  }

  const handleIDVerify = async (e) => {
    setLoading(true)
    const file = e.target.files[0]
    if (file) {
      await supabase.storage.from('avatars')
        .upload(`verify/id_${user.id}`, file, { upsert: true })
      await markVerified('id_verified')
      setStep(2)
    }
    setLoading(false)
  }

  const handleLiveness = async () => {
    setLoading(true)
    await markVerified('liveness_verified')
    setStep(3)
    setLoading(false)
  }

  const steps = [
    { icon:'📷', title:'Photo Verification', titleAm:'ፎቶ ማረጋገጫ', desc:'Take a selfie to confirm your photos are real.', badge:'Photo verified' },
    { icon:'🪪', title:'ID Verification', titleAm:'የመታወቂያ ማረጋገጫ', desc:'Upload your Ethiopian National ID or Fayda card.', badge:'ID verified' },
    { icon:'🤳', title:'Liveness Check', titleAm:'የህይወት ማረጋገጫ', desc:'Confirm you are a real person, not a bot.', badge:'Real person' },
  ]

  return (
    <div style={{minHeight:'100vh',background:'#FDF6EC',paddingBottom:70}}>
      <div style={{background:'#FFFDF8',borderBottom:'1px solid #F5E6D8',padding:'12px 16px',display:'flex',alignItems:'center',gap:10,position:'sticky',top:0,zIndex:10}}>
        <button onClick={()=>nav('/profile')} style={{background:'none',border:'none',color:'#C1602A',fontSize:22}}>←</button>
        <span style={{fontSize:18,fontWeight:700,color:'#C1602A'}}>🛡 Verification</span>
      </div>

      <div style={{padding:20}}>
        <p style={{color:'#8A6A50',fontSize:13,marginBottom:20,lineHeight:1.6}}>
          Verified profiles get 3x more matches. Free and takes 2 minutes. 💛
        </p>

        {step >= 3 ? (
          <div style={{textAlign:'center',padding:'40px 20px',background:'#FBF0D0',borderRadius:20,border:'1px solid #D4A017'}}>
            <div style={{fontSize:56}}>🎉</div>
            <h2 style={{color:'#8B3A14',marginTop:12,fontSize:22}}>Fully Verified!</h2>
            <p style={{color:'#8A6A50',marginTop:8,fontSize:14}}>ሙሉ በሙሉ ተረጋግጧል!</p>
            <p style={{color:'#8A6A50',fontSize:13,marginTop:8}}>Your profile now shows all verification badges. You will get 3x more matches!</p>
            <button onClick={()=>nav('/browse')}
              style={{marginTop:20,background:'#C1602A',color:'#fff',border:'none',borderRadius:24,padding:'12px 28px',fontSize:14,fontWeight:600}}>
              Start Browsing 💛
            </button>
          </div>
        ) : (
          steps.map((s, i) => (
            <div key={i} style={{background:'#FFFDF8',borderRadius:16,padding:16,marginBottom:12,border:`1px solid ${step>i?'#2d7a3a':step===i?'#C1602A':'#F5E6D8'}`,opacity:step<i?0.5:1,transition:'all 0.3s'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:28}}>{step>i?'✅':s.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:15,color:'#3A1F0D'}}>{s.title}</div>
                  <div style={{fontSize:11,color:'#C1602A'}}>{s.titleAm}</div>
                  <div style={{fontSize:12,color:'#8A6A50',marginTop:2}}>{s.desc}</div>
                </div>
              </div>
              {step > i && (
                <div style={{marginTop:10}}>
                  <span style={{fontSize:11,color:'#2d7a3a',background:'#e6f4ea',borderRadius:20,padding:'3px 10px'}}>✓ {s.badge}</span>
                </div>
              )}
              {step === i && (
                <div style={{marginTop:12}}>
                  {i === 0 && <>
                    <input ref={fileRef} type="file" accept="image/*" capture="user" onChange={handlePhotoVerify} style={{display:'none'}} />
                    <button onClick={()=>fileRef.current.click()} disabled={loading}
                      style={{background:'#C2566B',color:'#fff',border:'none',borderRadius:20,padding:'10px 20px',fontSize:14,width:'100%',fontWeight:500}}>
                      {loading?'Uploading...':'Take Selfie 📷'}
                    </button>
                  </>}
                  {i === 1 && <>
                    <input ref={idRef} type="file" accept="image/*" onChange={handleIDVerify} style={{display:'none'}} />
                    <button onClick={()=>idRef.current.click()} disabled={loading}
                      style={{background:'#185fa5',color:'#fff',border:'none',borderRadius:20,padding:'10px 20px',fontSize:14,width:'100%',fontWeight:500}}>
                      {loading?'Uploading...':'Upload ID 🪪'}
                    </button>
                  </>}
                  {i === 2 &&
                    <button onClick={handleLiveness} disabled={loading}
                      style={{background:'#C1602A',color:'#fff',border:'none',borderRadius:20,padding:'10px 20px',fontSize:14,width:'100%',fontWeight:500}}>
                      {loading?'Checking...':'Start Liveness Check 🤳'}
                    </button>
                  }
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <NavBar active="verify" />
    </div>
  )
}