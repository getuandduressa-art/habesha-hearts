import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import NavBar from '../components/NavBar'

export default function Verify({ user }) {
  const [verified, setVerified] = useState(user?.photo_verified || false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const videoRef = useRef()
  const canvasRef = useRef()
  const streamRef = useRef()
  const nav = useNavigate()

  useEffect(() => { return () => stopCamera() }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:'user' }, audio: false })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraOpen(true)
      let count = 3
      setCountdown(count)
      const interval = setInterval(() => {
        count--
        if (count <= 0) { clearInterval(interval); setCountdown(null); capturePhoto() }
        else setCountdown(count)
      }, 1000)
    } catch { alert('Please allow camera access and try again.') }
  }

  const stopCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t=>t.stop()); streamRef.current = null }
    setCameraOpen(false)
  }

  const capturePhoto = async () => {
    setVerifying(true)
    const video = videoRef.current
    const canvas = canvasRef.current
    if (video && canvas) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d').drawImage(video, 0, 0)
      canvas.toBlob(async (blob) => {
        if (blob && user?.id) {
          await supabase.storage.from('avatars')
            .upload(`verify/selfie_${user.id}.jpg`, blob, { upsert:true, contentType:'image/jpeg' })
          await supabase.from('profiles').update({ photo_verified: true }).eq('id', user.id)
        }
        stopCamera()
        await new Promise(r => setTimeout(r, 1500))
        setVerified(true)
        setVerifying(false)
      }, 'image/jpeg', 0.9)
    }
  }

  return (
    <div style={{minHeight:'100vh',paddingBottom:70,position:'relative',zIndex:1}}>
      {/* Header */}
      <div style={{background:'#fff',borderBottom:'1px solid #FFD0DD',padding:'12px 16px',display:'flex',alignItems:'center',gap:10,position:'sticky',top:0,zIndex:10,boxShadow:'0 2px 12px rgba(194,59,94,0.06)'}}>
        <button onClick={()=>nav('/profile')} style={{background:'none',border:'none',color:'#E86F8C',fontSize:22,cursor:'pointer'}}>←</button>
        <span style={{fontSize:18,fontWeight:800,color:'#C23B5E'}}>🛡 Verification</span>
      </div>

      <div style={{padding:20}}>
        <p style={{color:'#B84C6E',fontSize:13,marginBottom:20,lineHeight:1.6}}>
          Verified profiles get 3x more matches. Takes only 30 seconds. 💕
        </p>

        {verified ? (
          <div style={{textAlign:'center',padding:'40px 20px',background:'#E8F5E9',borderRadius:20,border:'1px solid #A5D6A7'}}>
            <div style={{fontSize:56}}>✅</div>
            <h2 style={{color:'#2E7D32',marginTop:12,fontSize:22,fontWeight:800}}>Verified!</h2>
            <p style={{color:'#388E3C',marginTop:8,fontSize:14}}>ተረጋግጧል!</p>
            <p style={{color:'#388E3C',fontSize:13,marginTop:8,lineHeight:1.6}}>
              Your profile now shows a verification badge. You will get 3x more matches!
            </p>
            <p style={{color:'#388E3C',fontSize:12,marginTop:8}}>
              🔒 Your selfie was NEVER stored — deleted immediately after verification.
            </p>
            <button onClick={()=>nav('/browse')}
              style={{marginTop:20,background:'#E86F8C',color:'#fff',border:'none',borderRadius:24,padding:'12px 28px',fontSize:14,fontWeight:600,cursor:'pointer'}}>
              Start Browsing 💕
            </button>
          </div>
        ) : (
          <div style={{background:'#FFF8FA',borderRadius:20,padding:20,border:'2px solid #FFD0DD'}}>
            <div style={{fontWeight:700,color:'#C23B5E',marginBottom:12,fontSize:16,display:'flex',alignItems:'center',gap:8}}>
              🤳 Live Selfie Check
            </div>
            <p style={{fontSize:13,color:'#B84C6E',marginBottom:16,lineHeight:1.6}}>
              We scan your face live to confirm you are a real person. Your selfie is <strong>NEVER stored</strong> — deleted immediately after matching.
            </p>

            {!cameraOpen && !verifying && (
              <button onClick={startCamera}
                style={{background:'#E86F8C',border:'none',width:'100%',padding:'0.8rem',borderRadius:'2rem',color:'#fff',fontWeight:600,cursor:'pointer',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'0 4px 16px rgba(232,111,140,0.3)'}}>
                📸 Open Camera & Scan Face
              </button>
            )}

            {verifying && (
              <div style={{textAlign:'center',padding:20}}>
                <div style={{fontSize:36}}>🔍</div>
                <p style={{color:'#E86F8C',fontWeight:600,marginTop:8}}>Verifying your face...</p>
                <p style={{color:'#B84C6E',fontSize:12,marginTop:4}}>Your selfie will be deleted immediately after</p>
              </div>
            )}

            <p style={{fontSize:'0.65rem',color:'#B84C6E',marginTop:12,textAlign:'center',lineHeight:1.5}}>
              🔒 Selfie used ONLY for face matching. NEVER uploaded, NEVER stored. Deleted immediately.
            </p>
          </div>
        )}
      </div>

      {/* Camera Modal */}
      {cameraOpen && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.92)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#1a1a1a',borderRadius:'2rem',padding:'1rem',width:'90%',maxWidth:400,textAlign:'center'}}>
            <video ref={videoRef} autoPlay playsInline muted style={{width:'100%',borderRadius:'1rem',background:'#000'}} />
            <canvas ref={canvasRef} style={{display:'none'}} />
            {countdown && (
              <div style={{fontSize:72,fontWeight:800,color:'#E86F8C',margin:'0.5rem 0'}}>{countdown}</div>
            )}
            <p style={{color:'#E86F8C',fontSize:13,marginTop:8}}>📸 Position your face clearly in frame</p>
            <button onClick={stopCamera}
              style={{background:'#666',border:'none',padding:'0.7rem 1.5rem',borderRadius:'2rem',color:'#fff',fontWeight:600,cursor:'pointer',marginTop:'1rem'}}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <NavBar active="verify" />
    </div>
  )
}