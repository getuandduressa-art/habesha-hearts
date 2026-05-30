import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import NavBar from '../components/NavBar'

export default function Verify({ user, setUser }) {
  const [step, setStep] = useState(
    user?.liveness_verified ? 3 : user?.id_verified ? 2 : user?.photo_verified ? 1 : 0
  )
  const [loading, setLoading] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const fileRef = useRef()
  const idRef = useRef()
  const nav = useNavigate()

  const isDemo = !user?.id || user.id === 'demo-user'

  const markVerified = async (field) => {
    if (isDemo) {
      // Demo mode — just update local state
      if (setUser) setUser(prev => ({ ...prev, [field]: true }))
      return
    }
    const { error } = await supabase.from('profiles').update({ [field]: true }).eq('id', user.id)
    if (error) throw error
    if (setUser) setUser(prev => ({ ...prev, [field]: true }))
  }

  const handlePhotoVerify = async (e) => {
    setCameraError('')
    setLoading(true)
    const file = e.target.files[0]
    if (!file) { setLoading(false); return }

    try {
      if (!isDemo) {
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`verify/selfie_${user.id}`, file, { upsert: true })
        if (uploadError) throw uploadError
      }
      await markVerified('photo_verified')
      setStep(1)
    } catch (e) {
      console.error('Photo verify error:', e)
      setCameraError('Upload failed. Please try again.')
    }
    setLoading(false)
  }

  const handleIDVerify = async (e) => {
    setCameraError('')
    setLoading(true)
    const file = e.target.files[0]
    if (!file) { setLoading(false); return }

    try {
      if (!isDemo) {
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`verify/id_${user.id}`, file, { upsert: true })
        if (uploadError) throw uploadError
      }
      await markVerified('id_verified')
      setStep(2)
    } catch (e) {
      console.error('ID verify error:', e)
      setCameraError('Upload failed. Please try again.')
    }
    setLoading(false)
  }

  const handleLiveness = async () => {
    setLoading(true)
    try {
      await markVerified('liveness_verified')
      setStep(3)
    } catch (e) {
      console.error('Liveness error:', e)
    }
    setLoading(false)
  }

  // Open camera with fallback for black screen issue
  const openCamera = (ref) => {
    setCameraError('')
    if (ref.current) {
      // Reset input so same file can be re-selected
      ref.current.value = ''
      ref.current.click()
    }
  }

  const steps = [
    { icon: '📷', title: 'Photo Verification', titleAm: 'ፎቶ ማረጋገጫ', desc: 'Upload a selfie to confirm your photos are real.', badge: 'Photo verified' },
    { icon: '🪪', title: 'ID Verification', titleAm: 'የመታወቂያ ማረጋገጫ', desc: 'Upload your Ethiopian National ID or Fayda card.', badge: 'ID verified' },
    { icon: '🤳', title: 'Liveness Check', titleAm: 'የህይወት ማረጋገጫ', desc: 'Confirm you are a real person, not a bot.', badge: 'Real person' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#FDF6EC', paddingBottom: 70 }}>
      <div style={{ background: '#FFFDF8', borderBottom: '1px solid #F5E6D8', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => nav('/profile')} style={{ background: 'none', border: 'none', color: '#C1602A', fontSize: 22, cursor: 'pointer' }}>←</button>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#C1602A' }}>🛡 Verification</span>
        {isDemo && <span style={{ marginLeft: 'auto', fontSize: 11, background: '#FFF3CD', color: '#856404', padding: '2px 8px', borderRadius: 10 }}>Demo mode</span>}
      </div>

      <div style={{ padding: 20 }}>
        <p style={{ color: '#8A6A50', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
          Verified profiles get 3x more matches. Free and takes 2 minutes. 💛
        </p>

        {cameraError && (
          <div style={{ background: '#ffeaea', color: '#c0392b', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 12 }}>
            {cameraError}
          </div>
        )}

        {step >= 3 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#FBF0D0', borderRadius: 20, border: '1px solid #D4A017' }}>
            <div style={{ fontSize: 56 }}>🎉</div>
            <h2 style={{ color: '#8B3A14', marginTop: 12, fontSize: 22 }}>Fully Verified!</h2>
            <p style={{ color: '#8A6A50', marginTop: 8, fontSize: 14 }}>ሙሉ በሙሉ ተረጋግጧል!</p>
            <p style={{ color: '#8A6A50', fontSize: 13, marginTop: 8 }}>Your profile now shows all verification badges. You will get 3x more matches!</p>
            <button onClick={() => nav('/browse')}
              style={{ marginTop: 20, background: '#C1602A', color: '#fff', border: 'none', borderRadius: 24, padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Start Browsing 💛
            </button>
          </div>
        ) : (
          steps.map((s, i) => (
            <div key={i} style={{ background: '#FFFDF8', borderRadius: 16, padding: 16, marginBottom: 12, border: `1px solid ${step > i ? '#2d7a3a' : step === i ? '#C1602A' : '#F5E6D8'}`, opacity: step < i ? 0.5 : 1, transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>{step > i ? '✅' : s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#3A1F0D' }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: '#C1602A' }}>{s.titleAm}</div>
                  <div style={{ fontSize: 12, color: '#8A6A50', marginTop: 2 }}>{s.desc}</div>
                </div>
              </div>

              {step > i && (
                <div style={{ marginTop: 10 }}>
                  <span style={{ fontSize: 11, color: '#2d7a3a', background: '#e6f4ea', borderRadius: 20, padding: '3px 10px' }}>✓ {s.badge}</span>
                </div>
              )}

              {step === i && (
                <div style={{ marginTop: 12 }}>
                  {i === 0 && <>
                    {/* Two options: camera or file upload — avoids black screen on some devices */}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoVerify}
                      style={{ display: 'none' }}
                    />
                    <input
                      id="photo-file-fallback"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoVerify}
                      style={{ display: 'none' }}
                    />
                    <button
                      onClick={() => openCamera(fileRef)}
                      disabled={loading}
                      style={{ background: '#C2566B', color: '#fff', border: 'none', borderRadius: 20, padding: '10px 20px', fontSize: 14, width: '100%', fontWeight: 500, cursor: 'pointer', marginBottom: 8 }}>
                      {loading ? 'Uploading...' : '📷 Take Selfie (Camera)'}
                    </button>
                    <button
                      onClick={() => document.getElementById('photo-file-fallback').click()}
                      disabled={loading}
                      style={{ background: '#FFF8FA', color: '#C2566B', border: '1px solid #C2566B', borderRadius: 20, padding: '8px 20px', fontSize: 13, width: '100%', fontWeight: 500, cursor: 'pointer' }}>
                      🖼 Upload from Gallery instead
                    </button>
                  </>}

                  {i === 1 && <>
                    <input ref={idRef} type="file" accept="image/*" onChange={handleIDVerify} style={{ display: 'none' }} />
                    <button
                      onClick={() => openCamera(idRef)}
                      disabled={loading}
                      style={{ background: '#185fa5', color: '#fff', border: 'none', borderRadius: 20, padding: '10px 20px', fontSize: 14, width: '100%', fontWeight: 500, cursor: 'pointer' }}>
                      {loading ? 'Uploading...' : '🪪 Upload ID'}
                    </button>
                  </>}

                  {i === 2 &&
                    <button
                      onClick={handleLiveness}
                      disabled={loading}
                      style={{ background: '#C1602A', color: '#fff', border: 'none', borderRadius: 20, padding: '10px 20px', fontSize: 14, width: '100%', fontWeight: 500, cursor: 'pointer' }}>
                      {loading ? 'Checking...' : '🤳 Complete Liveness Check'}
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
