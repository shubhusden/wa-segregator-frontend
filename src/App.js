import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ================= CONFIG ================= */

const API = "https://wa-segregator-backend.onrender.com/api";
const CATEGORY_META = {
  CRITICAL: "🔴",
  IMPORTANT: "🟠",
  CASUAL: "🟢",
  NON_IMPORTANT: "⚪",
  SPAM: "🔵",
  FAKE: "🟣",
};

const NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "inbox", label: "Inbox" },
  { id: "settings", label: "Settings" },
];

/* ================= STYLES ================= */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Manrope:wght@300;400;500;600&display=swap');

body{
  margin:0;
  font-family:Manrope,sans-serif;
  background:linear-gradient(135deg,#0f1a15,#0e1411);
  color:#f5f3ea;
}

.center{
  min-height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  flex-direction:column;
}

.card{
  background:#161f1a;
  border-radius:20px;
  padding:30px;
  width:340px;
}

.input{
  width:100%;
  padding:10px;
  border-radius:10px;
  border:none;
  margin-top:12px;
  background:#1c2721;
  color:white;
}

.btn{
  margin-top:15px;
  padding:10px 16px;
  border:none;
  border-radius:10px;
  background:linear-gradient(135deg,#4f8f6b,#2e5d47);
  color:white;
  cursor:pointer;
}

.btn.danger{
  background:linear-gradient(135deg,#b33939,#7a1f1f);
}

.app{
  display:flex;
  min-height:100vh;
}

.sidebar{
  width:220px;
  background:#161f1a;
  padding:24px;
}

.nav-item{
  padding:10px;
  cursor:pointer;
  border-radius:8px;
  margin-bottom:6px;
}

.nav-item.active{
  background:#1f2c24;
}

.main{
  flex:1;
  padding:30px;
}

.heading{
  font-family:'Cormorant Garamond',serif;
  font-size:32px;
  margin-bottom:20px;
}

.message{
  margin-top:15px;
  padding:12px;
  background:#1c2721;
  border-radius:8px;
}
`;

/* ================= UTIL ================= */

function getGreeting(){
  const hour=new Date().toLocaleString("en-IN",{hour:"numeric",hour12:false,timeZone:"Asia/Kolkata"});
  const h=parseInt(hour);
  if(h>=5&&h<12)return{text:"Good Morning",emoji:"🌅"};
  if(h>=12&&h<17)return{text:"Good Afternoon",emoji:"☀️"};
  if(h>=17&&h<21)return{text:"Good Evening",emoji:"🌆"};
  return{text:"Good Night",emoji:"🌙"};
}

async function apiFetch(path,opts={}){
  const res=await fetch(API+path,{
    headers:{ "Content-Type":"application/json" },
    ...opts,
    body:opts.body?JSON.stringify(opts.body):undefined
  });
  if(!res.ok) throw new Error();
  return res.json();
}

/* ================= ROOT ================= */

export default function App(){

  const storedUser = JSON.parse(localStorage.getItem("wa_user"));
  const [user,setUser] = useState(storedUser);
  const [step,setStep] = useState(storedUser ? "app" : "welcome");

  const [page,setPage]=useState("overview");
  const [messages,setMessages]=useState([]);
  const [stats,setStats]=useState({});
  const [toast,setToast]=useState(null);

  const {text,emoji}=getGreeting();

  const loadData=useCallback(async()=>{
    try{
      const [m,s]=await Promise.all([
        apiFetch("/messages"),
        apiFetch("/stats")
      ]);
      setMessages(m);
      setStats(s);
    }catch{}
  },[]);

  useEffect(()=>{
    if(step==="app") loadData();
  },[step,loadData]);

  /* ================= ONBOARDING ================= */

  if(step==="welcome"){
    return(
      <>
        <style>{STYLES}</style>
        <div className="center">
          <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}}>
            <h1 style={{fontFamily:"Cormorant Garamond, serif"}}>
              {emoji} {text}
            </h1>
            <button className="btn" onClick={()=>setStep("profile")}>
              Continue →
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  if(step==="profile"){
    return(
      <>
        <style>{STYLES}</style>
        <ProfileSetup onComplete={(u)=>{
          localStorage.setItem("wa_user",JSON.stringify(u));
          setUser(u);
          setStep("app");
        }} />
      </>
    );
  }

  /* ================= MAIN APP ================= */

  const addMessage=async(data)=>{
    try{
      const msg=await apiFetch("/messages",{method:"POST",body:data});
      setMessages(prev=>[msg,...prev]);
      loadData();
      setToast("Classified as "+msg.category);
      setTimeout(()=>setToast(null),3000);
    }catch{
      setToast("Backend error");
      setTimeout(()=>setToast(null),3000);
    }
  };

  const deleteMsg=async(id)=>{
    await apiFetch("/messages/"+id,{method:"DELETE"});
    loadData();
  };

  const clearAll=async()=>{
    await apiFetch("/messages",{method:"DELETE"});
    loadData();
  };

  const resetProfile=()=>{
    localStorage.removeItem("wa_user");
    window.location.reload();
  };

  return(
    <>
      <style>{STYLES}</style>

      <div className="app">
        <aside className="sidebar">
          <div style={{marginBottom:20,fontWeight:600}}>
            {user?.name}
          </div>
          {NAV_ITEMS.map(n=>(
            <div key={n.id}
                 className={`nav-item ${page===n.id?"active":""}`}
                 onClick={()=>setPage(n.id)}>
              {n.label}
            </div>
          ))}
        </aside>

        <main className="main">
          <div className="heading">
            {emoji} {text}, {user?.name}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{opacity:0,y:25}}
              animate={{opacity:1,y:0}}
              exit={{opacity:0,y:-25}}
              transition={{duration:0.35}}
            >
              {page==="overview" && (
                <div>
                  <strong>Total Messages:</strong> {stats.TOTAL||0}
                  {Object.keys(CATEGORY_META).map(k=>(
                    <div key={k}>
                      {CATEGORY_META[k]} {k}: {stats[k]||0}
                    </div>
                  ))}
                </div>
              )}

              {page==="inbox" && (
                <Inbox
                  messages={messages}
                  onAdd={addMessage}
                  onDelete={deleteMsg}
                />
              )}

              {page==="settings" && (
                <>
                  <button className="btn" onClick={clearAll}>
                    Clear All Messages
                  </button>
                  <button className="btn danger" onClick={resetProfile}>
                    Reset Profile
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {toast && (
        <div style={{
          position:"fixed",
          bottom:20,
          right:20,
          background:"#1c2721",
          padding:"12px 18px",
          borderRadius:12
        }}>
          {toast}
        </div>
      )}
    </>
  );
}

/* ================= PROFILE SETUP ================= */

function ProfileSetup({onComplete}){
  const [name,setName]=useState("");
  const [mobile,setMobile]=useState("");

  return(
    <div className="center">
      <div className="card">
        <h2 style={{fontFamily:"Cormorant Garamond, serif"}}>
          Set Up Profile
        </h2>
        <input className="input"
          placeholder="Your Name"
          value={name}
          onChange={e=>setName(e.target.value)}
        />
        <input className="input"
          placeholder="Mobile Number"
          value={mobile}
          onChange={e=>setMobile(e.target.value)}
        />
        <button className="btn"
          onClick={()=>onComplete({name,mobile})}>
          Enter App →
        </button>
      </div>
    </div>
  );
}

/* ================= INBOX ================= */

function Inbox({messages,onAdd,onDelete}){
  const [sender,setSender]=useState("");
  const [text,setText]=useState("");

  return(
    <>
      <input className="input"
        placeholder="Sender"
        value={sender}
        onChange={e=>setSender(e.target.value)}
      />
      <textarea className="input"
        placeholder="Type your WhatsApp message..."
        value={text}
        onChange={e=>setText(e.target.value)}
      />
      <button className="btn"
        onClick={()=>{
          if(!text.trim()) return;
          onAdd({sender:sender||"You",text});
          setText("");
        }}>
        Classify & Add
      </button>

      {messages.map(m=>(
        <div key={m.id} className="message">
          <strong>{m.sender}</strong> — {CATEGORY_META[m.category]} {m.category}
          <div style={{marginTop:6}}>{m.text}</div>
          <button style={{marginTop:6}} onClick={()=>onDelete(m.id)}>
            Delete
          </button>
        </div>
      ))}
    </>
  );
}