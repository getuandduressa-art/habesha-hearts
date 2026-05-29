import Avatar from './Avatar'
import VerifyBadge from './VerifyBadge'

export default function ProfileCard({ profile: p, onLike, onPass }) {
  const tag = (color, text) => (
    <span style={{fontSize:11,padding:'4px 12px',borderRadius:20,background:color+'15',color,fontWeight:500,border:`1px solid ${color}30`,display:'inline-block',margin:'0 4px 4px 0'}}>
      {text}
    </span>
  )

  return (
    <div style={{background:'#fff',borderRadius:'2rem',padding:22,border:'1px solid rgba(194,59,94,0.1)',boxShadow:'0 20px 40px -12px rgba(194,59,94,0.15)',width:'100%'}}>
      {/* Top */}
      <div style={{display:'flex',alignItems:'flex-start',gap:14,marginBottom:16}}>
        <Avatar name={p.name} photoUrl={p.photo_url} size={72} />
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
            <span style={{fontSize:20,fontWeight:800,color:'#C23B5E',letterSpacing:-0.3}}>{p.name}</span>
            {p.age && <span style={{fontSize:15,color:'#B84C6E',fontWeight:500}}>{p.age}</span>}
          </div>
          <div style={{marginTop:4}}>
            <VerifyBadge photo={p.photo_verified} id={p.id_verified} />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{height:'1px',background:'linear-gradient(90deg,transparent,#FFD0DD,transparent)',marginBottom:14}} />

      {/* Tags */}
      <div style={{marginBottom:12}}>
        {p.region && tag('#C23B5E', `📍 ${p.region}`)}
        {p.religion && tag('#E86F8C', `🙏 ${p.religion}`)}
        {p.vibe && tag('#B84C6E', p.vibe==='Traditional'?'🌿 Traditional':'✨ Modern')}
      </div>

      {/* Bio */}
      {p.bio && (
        <p style={{fontSize:14,color:'#B84C6E',lineHeight:1.7,marginBottom:20,fontStyle:'italic'}}>
          "{p.bio}"
        </p>
      )}

      {/* Buttons */}
      <div style={{display:'flex',justifyContent:'center',gap:24}}>
        <button onClick={onPass} style={{width:60,height:60,borderRadius:'50%',background:'#FFF8FA',border:'1.5px solid #FFD0DD',fontSize:22,color:'#E86F8C',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(232,111,140,0.15)'}}>
          ✕
        </button>
        <button onClick={onLike} style={{width:64,height:64,borderRadius:'50%',background:'#E86F8C',border:'none',fontSize:26,color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 6px 20px rgba(232,111,140,0.4)',transform:'scale(1.05)'}}>
          ♥
        </button>
        <button onClick={onLike} style={{width:60,height:60,borderRadius:'50%',background:'#FFF8FA',border:'1.5px solid #FFD0DD',fontSize:22,color:'#E86F8C',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(232,111,140,0.15)'}}>
          ⭐
        </button>
      </div>
    </div>
  )
}