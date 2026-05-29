import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Avatar from '../components/Avatar'

export default function Chat({ user }) {
  const { matchId } = useParams()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [other, setOther] = useState(null)
  const nav = useNavigate()
  const bottomRef = useRef()

  useEffect(() => {
    loadMessages()
    loadOther()
    const channel = supabase.channel(`chat:${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `match_id=eq.${matchId}`
      }, payload => setMessages(prev => [...prev, payload.new]))
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [matchId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    const { data } = await supabase.from('messages').select('*')
      .eq('match_id', matchId).order('created_at')
    setMessages(data || [])
  }

  const loadOther = async () => {
    const { data: match } = await supabase.from('matches')
      .select('user1,user2').eq('id', matchId).single()
    if (!match) return
    const otherId = match.user1 === user?.id ? match.user2 : match.user1
    const { data: profile } = await supabase.from('profiles')
      .select('*').eq('id', otherId).single()
    setOther(profile)
  }

  const send = async () => {
    if (!input.trim() || !user) return
    await supabase.from('messages').insert({
      match_id: matchId, sender_id: user.id, content: input.trim()
    })
    setInput('')
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'linear-gradient(135deg,#FFE4EC 0%,#FFD0DD 50%,#FEC8D6 100%)'}}>
      {/* Header */}
      <div style={{background:'#fff',borderBottom:'1px solid #FFD0DD',padding:'12px 16px',display:'flex',alignItems:'center',gap:12,boxShadow:'0 2px 12px rgba(194,59,94,0.06)'}}>
        <button onClick={()=>nav('/matches')}
          style={{background:'none',border:'none',color:'#E86F8C',fontSize:22,cursor:'pointer',padding:'0 4px'}}>←</button>
        <Avatar name={other?.name} photoUrl={other?.photo_url} size={40} />
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:15,color:'#C23B5E'}}>{other?.name || '...'}</div>
          <div style={{fontSize:11,color:'#B84C6E'}}>📍 {other?.region || ''}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:10}}>
        {messages.length === 0 && (
          <div style={{textAlign:'center',marginTop:60}}>
            <div style={{fontSize:36}}>👋</div>
            <p style={{color:'#B84C6E',fontSize:14,marginTop:8,fontWeight:500}}>Say hello! ሰላምታ ስጥ!</p>
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} style={{display:'flex',justifyContent:m.sender_id===user?.id?'flex-end':'flex-start'}}>
            <div style={{
              maxWidth:'75%',
              background:m.sender_id===user?.id?'#E86F8C':'#fff',
              color:m.sender_id===user?.id?'#fff':'#2C1810',
              borderRadius:m.sender_id===user?.id?'18px 18px 4px 18px':'18px 18px 18px 4px',
              padding:'10px 15px',fontSize:14,
              border:m.sender_id!==user?.id?'1px solid #FFD0DD':'none',
              boxShadow:'0 2px 8px rgba(194,59,94,0.1)',
              lineHeight:1.5
            }}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{padding:'12px 16px',background:'#fff',borderTop:'1px solid #FFD0DD',display:'flex',gap:10,boxShadow:'0 -2px 12px rgba(194,59,94,0.06)'}}>
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&send()}
          placeholder="Type a message..."
          style={{flex:1,borderRadius:24,border:'1px solid #FFD0DD',padding:'11px 18px',fontSize:14,background:'#FFF8FA',color:'#2C1810',outline:'none'}}
        />
        <button onClick={send}
          style={{width:46,height:46,borderRadius:'50%',background:'#E86F8C',border:'none',color:'#fff',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,boxShadow:'0 4px 12px rgba(232,111,140,0.4)'}}>
          ➤
        </button>
      </div>
    </div>
  )
}