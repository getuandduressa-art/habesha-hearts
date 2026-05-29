export default function Avatar({ name, photoUrl, size = 52 }) {
  const colors = ['#C1602A','#D4A017','#C2566B','#8B3A14','#6B8E23','#185fa5']
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length]

  if (photoUrl) return (
    <img
      src={photoUrl}
      alt={name}
      style={{width:size,height:size,borderRadius:'50%',objectFit:'cover',flexShrink:0,border:'2px solid #F5E6D8'}}
    />
  )

  return (
    <div style={{
      width:size,height:size,borderRadius:'50%',background:color,
      display:'flex',alignItems:'center',justifyContent:'center',
      color:'#fff',fontWeight:700,fontSize:size*0.35,flexShrink:0,
      border:'2px solid #F5E6D8'
    }}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}