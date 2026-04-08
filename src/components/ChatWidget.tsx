"use client";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";

const BUTTON_COLOR = "#0C447C";

const initialQuickReplies = [
  { fi: "Mitä maksaa kuljetus?", en: "What does transport cost?" },
  { fi: "Haluan tarjouksen", en: "I want a quote" },
  { fi: "Miten varaan?", en: "How do I book?" },
  { fi: "Aukioloajat", en: "Opening hours" },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<'fi'|'en'>('fi');
  const [messages, setMessages] = useState<Array<{ role: 'user'|'assistant', content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(false);
  const [showAutofill, setShowAutofill] = useState(false); // Placeholder for autofill logic
  const chatPanelRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (open && chatPanelRef.current) {
      chatPanelRef.current.scrollTop = chatPanelRef.current.scrollHeight;
      setUnread(false);
    }
  }, [messages, open]);

  // Show unread badge if new assistant message and chat is closed
  useEffect(() => {
    if (!open && messages.length > 0 && messages[messages.length-1].role === 'assistant') {
      setUnread(true);
    }
  }, [messages, open]);

  // Handle send
  const sendMessage = async (msg: string) => {
    const newMessages: { role: 'user' | 'assistant'; content: string }[] = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, language }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply as string }]);

      // Yksinkertainen tietojen tunnistus viestihistoriasta (voit laajentaa regexejä tarpeen mukaan)
      const allMsgs = [...newMessages, { role: 'assistant', content: data.reply as string }].map(m => m.content).join("\n");
      const hasName = /nimi[:=]?\s*\S+/i.test(allMsgs) || /name[:=]?\s*\S+/i.test(allMsgs);
      const hasPhoneOrEmail = /\b\d{5,}|@/i.test(allMsgs);
      const hasPickup = /(nouto|pickup)[^\n]{5,}/i.test(allMsgs);
      const hasDelivery = /(toimitus|delivery)[^\n]{5,}/i.test(allMsgs);
      const hasDate = /(\d{1,2}\.[0-1]?\d\.|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})/i.test(allMsgs);
      const hasDesc = /(kuvaus|tavara|item|description)[^\n]{5,}/i.test(allMsgs);
      if (hasName && hasPhoneOrEmail && hasPickup && hasDelivery && hasDate && hasDesc) {
        setShowAutofill(true);
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: language === 'fi' ? 'Tapahtui virhe. Yritä uudelleen.' : 'An error occurred. Please try again.' }]);
    }
    setLoading(false);
  };

  // Handle quick reply
  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

  // Handle language toggle
  const toggleLang = () => setLanguage(l => l === 'fi' ? 'en' : 'fi');

  // Helper: Extract info from AI confirmation message
  function extractInfoFromConfirmation(message: string) {
    // Example: "Nimi: Matti Meikäläinen, Puhelin: 0401234567, Sähköposti: matti@email.com, Nouto: Katu 1, Toimitus: Katu 2, Päivä: 10.4.2026, Kuvaus: Polkupyörä"
    const info: Record<string, string> = {};
    const patterns = {
      name: /Nimi[:=]?\s*([^,\n]+)/i,
      phone: /Puhelin[:=]?\s*([^,\n]+)/i,
      email: /Sähköposti[:=]?\s*([^,\n]+)/i,
      pickupAddress: /Nouto[:=]?\s*([^,\n]+)/i,
      deliveryAddress: /Toimitus[:=]?\s*([^,\n]+)/i,
      message: /Kuvaus[:=]?\s*([^,\n]+)/i,
    };
   for (const key of Object.keys(patterns) as Array<keyof typeof patterns>) {
  const match = message.match(patterns[key]);
      if (match) info[key] = match[1].trim();
    }
    return info;
  }

  // Handle autofill: dispatch event and scroll
  const handleAutofill = () => {
    // 1. Find the latest assistant message with a confirmation/summary
    const confirmationMsg = [...messages].reverse().find(
      m => m.role === 'assistant' && /Nimi[:=]|Name[:=]/i.test(m.content)
    );
    let info: Record<string, string> = {};
    if (confirmationMsg) {
      info = extractInfoFromConfirmation(confirmationMsg.content);
    }
    // 2. Dispatch autofill event for the quote form
    window.dispatchEvent(new CustomEvent('fp-autofill-quote', { detail: info }));
    // 3. Scroll to the form
    const form = document.getElementById('quote');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // 4. Show feedback
    alert(language === 'fi'
      ? 'Lomake täytetty automaattisesti. Tarkista tiedot ja lähetä!'
      : 'Form auto-filled. Please review and submit!');

    // 5. Send email notification to kuljetus@finishpoint.fi
    fetch('/api/quote/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info),
    });
  };

  return (
    <>
      {/* Floating button */}
      <button
        aria-label="Avaa chat"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: BUTTON_COLOR,
          color: '#fff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          zIndex: 1000,
          border: 'none',
          display: open ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <MessageCircle size={28} />
        {unread && <span style={{position:'absolute',top:10,right:10,width:12,height:12,borderRadius:'50%',background:'#e11d48',border:'2px solid #fff'}} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            right: 16,
            bottom: 80,
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            height: 520,
            maxHeight: 'calc(100vh - 100px)',
            borderRadius: 18,
            background: '#fff',
            boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            ...(window.innerWidth < 500 ? { left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', maxHeight: '100vh', borderRadius: 0 } : {})
          }}
        >
          {/* Header */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 20px 12px 20px',borderBottom:'1px solid #e5e7eb'}}>
            <span style={{fontWeight:700,fontSize:18,color:BUTTON_COLOR}}>Finishpoint Asiakaspalvelu</span>
            <div style={{display:'flex',gap:8}}>
              <button onClick={toggleLang} style={{fontSize:13,padding:'2px 8px',borderRadius:6,border:'1px solid #e5e7eb',background:'#f5f6f8',color:BUTTON_COLOR}}>{language==='fi'?'EN':'FI'}</button>
              <button aria-label="Sulje chat" onClick={()=>setOpen(false)} style={{background:'none',border:'none',fontSize:24,color:'#6b7a8d',marginLeft:8,cursor:'pointer'}}><X size={24}/></button>
            </div>
          </div>
          {/* Messages */}
          <div ref={chatPanelRef} style={{flex:1,overflowY:'auto',padding:20,background:'#f5f6f8'}}>
            {messages.length === 0 && (
              <div style={{marginBottom:16}}>
                {initialQuickReplies.map(q => (
                  <button key={q.fi} onClick={()=>handleQuickReply(q[language])} style={{margin:'0 8px 8px 0',padding:'8px 14px',borderRadius:16,border:'1px solid #e5e7eb',background:'#fff',color:BUTTON_COLOR,fontSize:14,cursor:'pointer'}}>{q[language]}</button>
                ))}
              </div>
            )}
            {messages.map((m,i) => (
              <div key={i} style={{marginBottom:12,display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
                <div style={{background:m.role==='user'?BUTTON_COLOR:'#fff',color:m.role==='user'?'#fff':'#222',borderRadius:14,padding:'10px 16px',maxWidth:260,boxShadow:m.role==='user'?'none':'0 1px 4px rgba(0,0,0,0.04)'}}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div style={{marginBottom:12,display:'flex',justifyContent:'flex-start'}}>
                <div style={{background:'#fff',color:'#222',borderRadius:14,padding:'10px 16px',maxWidth:260,boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                  <span className="animate-pulse">...
                  </span>
                </div>
              </div>
            )}
          </div>
          {/* Input */}
          <form onSubmit={e=>{e.preventDefault();if(input.trim())sendMessage(input.trim());}} style={{display:'flex',alignItems:'center',padding:16,borderTop:'1px solid #e5e7eb',background:'#fff'}}>
            {showAutofill && (
              <button type="button" onClick={handleAutofill} style={{marginRight:8,padding:'6px 12px',borderRadius:8,background:BUTTON_COLOR,color:'#fff',border:'none',fontWeight:600,fontSize:14}}>Täytä lomake automaattisesti</button>
            )}
            <input
              value={input}
              onChange={e=>setInput(e.target.value)}
              placeholder={language==='fi'?'Kirjoita viesti...':'Type a message...'}
              style={{flex:1,padding:'10px 14px',borderRadius:8,border:'1px solid #e5e7eb',fontSize:15,marginRight:8}}
              disabled={loading}
            />
            <button type="submit" disabled={loading||!input.trim()} style={{background:BUTTON_COLOR,color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:600,fontSize:15,cursor:loading?'not-allowed':'pointer'}}>Lähetä</button>
          </form>
        </div>
      )}
    </>
  );
}
