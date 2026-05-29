export default function VerifyBadge({ photo, id }) {
  if (!photo && !id) return (
    <span style={{fontSize:11,color:'#8A6A50',background:'#f0ebe4',borderRadius:20,padding:'2px 8px'}}>
      Unverified
    </span>
  )
  return (
    <span style={{display:'flex',gap:4,alignItems:'center',flexWrap:'wrap'}}>
      {photo && (
        <span style={{fontSize:11,color:'#2d7a3a',background:'#e6f4ea',borderRadius:20,padding:'2px 8px'}}>
          📷 Photo
        </span>
      )}
      {id && (
        <span style={{fontSize:11,color:'#185fa5',background:'#e6f1fb',borderRadius:20,padding:'2px 8px'}}>
          🪪 ID
        </span>
      )}
    </span>
  )
}