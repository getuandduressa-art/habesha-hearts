import { useNavigate } from 'react-router-dom'

export default function NavBar({ active }) {
  const nav = useNavigate()
  const items = [
    ['🔍', '/browse', 'browse', 'Browse'],
    ['💬', '/matches', 'matches', 'Matches'],
    ['👤', '/profile', 'profile', 'Profile'],
    ['🛡', '/verify', 'verify', 'Verify'],
  ]

  return (
    <div style={{
      position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',
      width:'100%',maxWidth:480,
      background:'#fff',
      borderTop:'1px solid #FFD0DD',
      display:'flex',justifyContent:'space-around',
      padding:'10px 0 14px',zIndex:50,
      boxShadow:'0 -4px 20px rgba(194,59,94,0.08)'
    }}>
      {items.map(([icon, path, id, label]) => (
        <button key={id} onClick={() => nav(path)}
          style={{background:'none',border:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'4px 12px',cursor:'pointer'}}>
          <span style={{fontSize:22,filter:active===id?'drop-shadow(0 0 6px #E86F8C)':'none'}}>{icon}</span>
          <span style={{fontSize:10,color:active===id?'#E86F8C':'#B84C6E',fontWeight:active===id?700:400,letterSpacing:0.3}}>{label}</span>
          {active===id && <div style={{width:4,height:4,borderRadius:'50%',background:'#E86F8C'}} />}
        </button>
      ))}
    </div>
  )
}