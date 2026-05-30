import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const RELIGIONS = ['Orthodox Christian','Muslim','Protestant','Catholic','Other']
const REGIONS = ['Addis Ababa','Oromia','Amhara','Tigray','SNNPR','Harari','Dire Dawa']
const INTERESTS = ['🎵 Music','⚽ Sports','💼 Business','🎨 Art','💻 Tech','🕊️ Faith','🍜 Food','✈️ Travel','🏺 Culture','📚 Learning']
const LOOKING_FOR = ['❤️ Dating','👋 Friendship','💼 Networking','🧠 Advice','🗣️ Just to Talk']

export default function Welcome({ user, setUser }) {
  const [form, setForm] = useState({ name: '', age: '', region: '', religion: '', vibe: 'Modern', bio: '' })
  const [interests, setInterests] = useState([])
  const [lookingFor, setLookingFor] = useState([])
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const nav = useNavigate()

  useEffect(() => {
    if (user?.name && user.name !== 'Demo User') {
      setForm(p => ({ ...p, name: user.name }))
    }
    if (user?.photo_url) {
      setPhotoPreview(user.photo_url)
    }
  }, [user])

  const toggleInterest = (i) => setInterests(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])
  const toggleLooking = (i) => setLookingFor(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const save = async () => {
    setError('')
    if (!form.name.trim()) { setError('Please enter your name'); return }
    if (!form.age) { setError('Please enter your age'); return }
    if (parseInt(form.age) < 18) { setError('You must be 18 or older'); return }
    if (!form.region) { setError('Please select your region'); return }
    if (!form.religion) { setError('Please select your religion'); return }
    if (!privacyAgreed) { setError('Please agree to the privacy terms'); return }

    setSaving(true)
    try {
      let photo_url = user?.photo_url || null

      if (photoFile && user?.id && user.id !== 'demo-user') {
        const ext = photoFile.name.split('.').pop()
        const path = `${user.id}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars').upload(path, photoFile, { upsert: true })
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
          photo_url = publicUrl
        }
      }

      const updates = {
        name: form.name.trim(),
        age: parseInt(form.age),
        region: form.region,
        religion: form.religion,
        vibe: form.vibe,
        bio: form.bio.trim(),
        photo_url,
        interests,
        looking_for: lookingFor,
        profile_complete: true,
        updated_at: new Date().toISOString(),
      }

      if (user?.id && user.id !== 'demo-user') {
        // Real Supabase user
        const { error: updateError } = await supabase
          .from('profiles').update(updates).eq('id', user.id)
        if (updateError) throw updateError
        setUser(prev => ({ ...prev, ...updates }))
      } else {
        // Demo mode — save to localStorage
        const demoProfile = { ...user, ...updates }
        localStorage.setItem('habesha_demo_profile', JSON.stringify(demoProfile))
        setUser(demoProfile)
      }

      nav('/browse')
    } catch (e) {
      console.error('Save error:', e)
      setError('Something went wrong: ' + (e.message || 'Please try again'))
    }
    setSaving(false)
  }

  const C = {
    page: { minHeight: '100vh', padding: '1.5rem', background: '#FDF6EC' },
    logo: { textAlign: 'center', marginBottom: '1.5rem' },
    logoTitle: { fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#C23B5E', margin: 0 },
    logoAm: { fontSize: '1rem', fontWeight: 500, color: '#B84C6E', display: 'block' },
    tagline: { fontSize: '0.8rem', color: '#C23B5E', marginTop: '0.3rem' },
    card: { background: '#fff', borderRadius: '2rem', padding: '1.8rem', boxShadow: '0 20px 40px -12px rgba(194,59,94,0.15)', border: '1px solid rgba(194,59,94,0.1)', marginBottom: '2rem' },
    label: { display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#B84C6E', marginBottom: '0.4rem' },
    row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
    inputWrap: { marginBottom: '1rem' },
    sectionTitle: { fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#C23B5E', margin: '1.2rem 0 0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    tag: (active) => ({ background: active ? '#E86F8C' : '#FFF8FA', border: `1px solid ${active ? '#E86F8C' : '#FFD0DD'}`, borderRadius: '2rem', padding: '0.35rem 0.9rem', fontSize: '0.75rem', fontWeight: 500, color: active ? '#fff' : '#2C1810', cursor: 'pointer', transition: 'all 0.2s', display: 'inline-block', margin: '0 0.3rem 0.4rem 0' }),
    vibeToggle: { display: 'flex', gap: '0.75rem', background: '#FFF8FA', padding: '0.3rem', borderRadius: '3rem', border: '1px solid #FFD0DD', marginBottom: '1rem' },
    vibeBtn: (active) => ({ flex: 1, background: active ? '#E86F8C' : 'transparent', border: 'none', padding: '0.5rem 0', borderRadius: '2rem', fontWeight: 600, fontSize: '0.8rem', color: active ? '#fff' : '#B84C6E', cursor: 'pointer' }),
    photoArea: { border: '2px dashed #FFD0DD', borderRadius: '1rem', padding: '0.8rem', textAlign: 'center', marginBottom: '0.8rem', cursor: 'pointer', color: '#B84C6E', fontSize: '0.85rem' },
    submitBtn: { width: '100%', background: saving ? '#ccc' : '#E86F8C', border: 'none', padding: '0.9rem', borderRadius: '1.5rem', fontWeight: 700, fontSize: '1rem', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', marginTop: '1rem' },
    error: { color: '#c0392b', fontSize: '0.75rem', textAlign: 'center', marginBottom: '0.5rem', padding: '0.5rem', background: '#ffeaea', borderRadius: '0.5rem' },
  }

  return (
    <div style={C.page}>
      <div style={C.logo}>
        <h1 style={C.logoTitle}>Habesha Hearts <span style={C.logoAm}>ሀበሻ ልቦች</span></h1>
        <div style={C.tagline}>🛡 Verified · Safe · Community First</div>
      </div>

      <div style={C.card}>
        <div style={C.row2}>
          <div>
            <label style={C.label}>Display Name *</label>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Selam T."
              style={{ width: '100%', padding: '0.6rem', borderRadius: '0.75rem', border: '1px solid #FFD0DD', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={C.label}>Age *</label>
            <input
              type="number"
              value={form.age}
              onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
              placeholder="18+"
              min={18} max={60}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '0.75rem', border: '1px solid #FFD0DD', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={C.row2}>
          <div>
            <label style={C.label}>Region *</label>
            <select
              value={form.region}
              onChange={e => setForm(p => ({ ...p, region: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '0.75rem', border: '1px solid #FFD0DD', fontSize: '0.9rem', boxSizing: 'border-box' }}
            >
              <option value="">Select</option>
              {REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={C.label}>Religion *</label>
            <select
              value={form.religion}
              onChange={e => setForm(p => ({ ...p, religion: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '0.75rem', border: '1px solid #FFD0DD', fontSize: '0.9rem', boxSizing: 'border-box' }}
            >
              <option value="">Select</option>
              {RELIGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div style={C.inputWrap}>
          <label style={C.label}>Bio / ስለ እራስዎ</label>
          <textarea
            value={form.bio}
            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            placeholder="Tell us about yourself..."
            rows={3}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '0.75rem', border: '1px solid #FFD0DD', fontSize: '0.9rem', resize: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={C.sectionTitle}>🎯 Looking For</div>
        <div style={{ marginBottom: '1rem' }}>
          {LOOKING_FOR.map(l => (
            <span key={l} style={C.tag(lookingFor.includes(l))} onClick={() => toggleLooking(l)}>{l}</span>
          ))}
        </div>

        <div style={C.sectionTitle}>🏷 Interests</div>
        <div style={{ marginBottom: '1rem' }}>
          {INTERESTS.map(i => (
            <span key={i} style={C.tag(interests.includes(i))} onClick={() => toggleInterest(i)}>{i}</span>
          ))}
        </div>

        <label style={C.label}>Vibe</label>
        <div style={C.vibeToggle}>
          {['Traditional', 'Modern'].map(v => (
            <button key={v} style={C.vibeBtn(form.vibe === v)} onClick={() => setForm(p => ({ ...p, vibe: v }))}>
              {v === 'Traditional' ? '🌿 Traditional' : '✨ Modern'}
            </button>
          ))}
        </div>

        <div style={C.sectionTitle}>📸 Profile Photo</div>
        <label style={C.photoArea}>
          {photoPreview
            ? <img src={photoPreview} style={{ width: 80, height: 80, borderRadius: '1rem', objectFit: 'cover' }} alt="preview" />
            : <div>📸 Upload your profile photo<br /><span style={{ fontSize: '0.7rem', color: '#B84C6E' }}>Tap to upload</span></div>
          }
          <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
        </label>

        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #FFD0DD' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="checkbox"
              checked={privacyAgreed}
              onChange={e => setPrivacyAgreed(e.target.checked)}
              style={{ width: 15, height: 15, marginTop: 2, accentColor: '#E86F8C' }}
            />
            <label style={{ fontSize: '0.7rem', color: '#2C1810' }}>
              I understand and agree to the privacy terms / የግላዊነት ውሎችን ተረድቻለሁ
            </label>
          </div>
          <span
            style={{ color: '#E86F8C', cursor: 'pointer', fontSize: '0.65rem', textDecoration: 'underline', marginLeft: '1.4rem' }}
            onClick={() => setPrivacyOpen(p => !p)}
          >
            📜 {privacyOpen ? 'Hide' : 'Read'} privacy summary
          </span>
          {privacyOpen && (
            <div style={{ background: '#FFF8FA', borderRadius: '0.75rem', padding: '0.6rem', fontSize: '0.65rem', color: '#B84C6E', marginTop: '0.5rem', lineHeight: 1.6 }}>
              <p><strong>🔒 What we collect:</strong> Name, bio, profile photo, interests.</p>
              <p><strong>🚫 What we DON'T store:</strong> Your verification selfie.</p>
              <p><strong>🎯 You control your privacy.</strong></p>
            </div>
          )}
        </div>

        {error && <p style={C.error}>{error}</p>}

        <button style={C.submitBtn} onClick={save} disabled={saving}>
          {saving ? '⏳ Saving...' : '❤️ Join Habesha Hearts →'}
        </button>
      </div>
    </div>
  )
}
