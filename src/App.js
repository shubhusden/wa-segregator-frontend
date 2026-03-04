import { useState, useEffect } from "react";

const API = "https://wa-segregator-backend.onrender.com/api";

const CATEGORY_COLORS = {
  CRITICAL: "#ef4444",
  IMPORTANT: "#f97316",
  CASUAL: "#22c55e",
  NON_IMPORTANT: "#94a3b8",
  SPAM: "#a855f7",
  FAKE: "#ec4899"
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default function App() {

  const [user,setUser] = useState(
    JSON.parse(localStorage.getItem("priion_user"))
  );

  const [messages,setMessages] = useState([]);
  const [stats,setStats] = useState({});
  const [sender,setSender] = useState("");
  const [text,setText] = useState("");

  const greeting = getGreeting();

  async function loadData(){
    try{
      const m = await fetch(API+"/messages").then(r=>r.json());
      const s = await fetch(API+"/stats").then(r=>r.json());
      setMessages(m);
      setStats(s);
    }catch{}
  }

  useEffect(()=>{
    loadData();
  },[]);

  async function classify(){
    if(!text.trim()) return;

    const msg = await fetch(API+"/messages",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        sender:sender||"You",
        text
      })
    }).then(r=>r.json());

    setText("");
    setMessages(prev=>[msg,...prev]);
    loadData();
  }

  async function deleteMsg(id){
    await fetch(API+"/messages/"+id,{method:"DELETE"});
    loadData();
  }

  if(!user){
    return <ProfileSetup onComplete={(u)=>{
      localStorage.setItem("priion_user",JSON.stringify(u));
      setUser(u);
    }} />;
  }

  return (
    <div style={styles.page}>

      <Navbar user={user} />

      <div style={styles.container}>

        <h1 style={styles.greeting}>
          {greeting}, {user.name}
        </h1>

        <QuickCards stats={stats}/>

        <InputCard
          sender={sender}
          text={text}
          setSender={setSender}
          setText={setText}
          classify={classify}
        />

        <Messages messages={messages} deleteMsg={deleteMsg}/>

      </div>
    </div>
  );
}

function Navbar({user}){

  return(
    <div style={styles.navbar}>
      <div>
        <div style={styles.logo}>PRIION</div>
        <div style={styles.tagline}>Prioritise What Matters</div>
      </div>

      <div style={styles.user}>
        🎓 {user.name}
      </div>
    </div>
  )
}

function QuickCards({stats}){

  return(
    <div style={styles.grid3}>

      <Card title="Critical" value={stats.CRITICAL||0}/>
      <Card title="Important" value={stats.IMPORTANT||0}/>
      <Card title="Spam" value={stats.SPAM||0}/>

    </div>
  )
}

function Card({title,value}){
  return(
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value}</div>
    </div>
  )
}

function InputCard({sender,text,setSender,setText,classify}){

  return(
    <div style={styles.card}>

      <h3>Classify Message</h3>

      <input
        style={styles.input}
        placeholder="Sender"
        value={sender}
        onChange={e=>setSender(e.target.value)}
      />

      <textarea
        style={styles.input}
        placeholder="Paste WhatsApp message"
        value={text}
        onChange={e=>setText(e.target.value)}
      />

      <button style={styles.button} onClick={classify}>
        Classify
      </button>

    </div>
  )
}

function Messages({messages,deleteMsg}){

  return(
    <div style={styles.card}>

      <h3>Messages</h3>

      {messages.length===0 && (
        <p style={{opacity:.6}}>No messages yet</p>
      )}

      {messages.map(m=>(
        <div key={m.id} style={styles.message}>

          <div>
            <strong>{m.sender}</strong>
            <div style={{opacity:.7,fontSize:14}}>
              {m.text}
            </div>
          </div>

          <div style={{
            ...styles.badge,
            background:CATEGORY_COLORS[m.category]
          }}>
            {m.category}
          </div>

          <button
            style={styles.delete}
            onClick={()=>deleteMsg(m.id)}
          >
            Delete
          </button>

        </div>
      ))}

    </div>
  )
}

function ProfileSetup({onComplete}){

  const [name,setName] = useState("");
  const [mobile,setMobile] = useState("");

  return(
    <div style={styles.center}>

      <div style={styles.card}>

        <h2>Welcome to PRIION</h2>

        <input
          style={styles.input}
          placeholder="Name"
          value={name}
          onChange={e=>setName(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Mobile"
          value={mobile}
          onChange={e=>setMobile(e.target.value)}
        />

        <button
          style={styles.button}
          onClick={()=>onComplete({name,mobile})}
        >
          Continue
        </button>

      </div>

    </div>
  )
}

const styles={

page:{
background:"radial-gradient(circle at top left,#0f172a,#020617)",
minHeight:"100vh",
color:"#e2e8f0",
fontFamily:"Inter, sans-serif"
},

container:{
maxWidth:1100,
margin:"auto",
padding:20
},

navbar:{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
padding:"20px 40px"
},

logo:{
fontWeight:700,
fontSize:20
},

tagline:{
fontSize:12,
opacity:.6
},

user:{
fontSize:14,
opacity:.8
},

greeting:{
marginBottom:20
},

grid3:{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
gap:20,
marginBottom:20
},

card:{
background:"rgba(15,23,42,0.6)",
border:"1px solid rgba(255,255,255,0.08)",
borderRadius:16,
padding:20,
marginBottom:20,
backdropFilter:"blur(10px)"
},

cardTitle:{
opacity:.7
},

cardValue:{
fontSize:24,
fontWeight:700
},

input:{
width:"100%",
marginTop:10,
padding:10,
borderRadius:8,
border:"1px solid rgba(255,255,255,0.1)",
background:"#020617",
color:"#fff"
},

button:{
marginTop:10,
padding:"10px 16px",
background:"#38bdf8",
border:"none",
borderRadius:8,
cursor:"pointer"
},

message:{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginTop:12,
gap:10
},

badge:{
padding:"4px 8px",
borderRadius:6,
fontSize:12
},

delete:{
background:"transparent",
color:"#ef4444",
border:"none",
cursor:"pointer"
},

center:{
display:"flex",
alignItems:"center",
justifyContent:"center",
height:"100vh"
}

}
