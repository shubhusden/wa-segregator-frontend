import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API = "https://wa-segregator-backend.onrender.com/api";

const roles = [
{ id:"student", label:"Student", icon:"🎓" },
{ id:"teacher", label:"Teacher", icon:"📚" },
{ id:"business", label:"Business", icon:"💼" },
{ id:"corporate", label:"Corporate", icon:"🏢" }
];

const colors = {
CRITICAL:"#ef4444",
IMPORTANT:"#f97316",
CASUAL:"#22c55e",
NON_IMPORTANT:"#94a3b8",
SPAM:"#a855f7",
FAKE:"#ec4899"
};

const pageMotion={
initial:{opacity:0,y:40,scale:.95},
animate:{opacity:1,y:0,scale:1},
exit:{opacity:0,y:-40,scale:.95},
transition:{duration:.45}
};

function greet(){
const h=new Date().getHours();
if(h<12) return "Good Morning";
if(h<18) return "Good Afternoon";
return "Good Evening";
}

export default function App(){

const saved=JSON.parse(localStorage.getItem("priion_user"));

const[step,setStep]=useState(saved?"dashboard":"welcome");
const[user,setUser]=useState(saved||null);
const[role,setRole]=useState(saved?.role||null);

const[messages,setMessages]=useState([]);
const[stats,setStats]=useState({});

const[sender,setSender]=useState("");
const[text,setText]=useState("");

async function load(){
try{
const m=await fetch(API+"/messages").then(r=>r.json());
const s=await fetch(API+"/stats").then(r=>r.json());
setMessages(m);
setStats(s);
}catch{}
}

useEffect(()=>{ if(step==="dashboard") load(); },[step]);

async function classify(){

if(!text.trim()) return;

const msg=await fetch(API+"/messages",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({sender:sender||"You",text})
}).then(r=>r.json());

setMessages(prev=>[msg,...prev]);
setText("");
load();
}

async function deleteMsg(id){
await fetch(API+"/messages/"+id,{method:"DELETE"});
load();
}

function saveProfile(data){
const u={...data,role};
localStorage.setItem("priion_user",JSON.stringify(u));
setUser(u);
setStep("dashboard");
}

return(

<div style={styles.page}>

<AnimatePresence mode="wait">

{step==="welcome" && (
<Welcome key="w" next={()=>setStep("role")}/>
)}

{step==="role" && (
<RoleSelect key="r" choose={(r)=>{setRole(r);setStep("profile");}}/>
)}

{step==="profile" && ( <Profile key="p" done={saveProfile}/>
)}

{step==="dashboard" && ( <Dashboard
key="d"
user={user}
messages={messages}
stats={stats}
sender={sender}
text={text}
setSender={setSender}
setText={setText}
classify={classify}
deleteMsg={deleteMsg}
/>
)}

</AnimatePresence>

</div>

);
}

function Welcome({next}){
return(
<motion.div {...pageMotion} style={styles.center}>

<div style={{textAlign:"center"}}>

<div style={styles.logo}>PRIION</div>

<div style={styles.tagline}>
Prioritise What Matters
</div>

<button style={styles.btn} onClick={next}>
Enter →
</button>

</div>

</motion.div>
);
}

function RoleSelect({choose}){

return(

<motion.div {...pageMotion} style={styles.center}>

<div style={styles.card}>

<h2>Select Role</h2>

<div style={styles.roleGrid}>

{roles.map(r=>(

<div
key={r.id}
style={styles.role}
onClick={()=>choose(r.id)}
>
<div style={{fontSize:28}}>{r.icon}</div>
<div>{r.label}</div>
</div>
))}

</div>

</div>

</motion.div>

);
}

function Profile({done}){

const[name,setName]=useState("");
const[phone,setPhone]=useState("");

return(

<motion.div {...pageMotion} style={styles.center}>

<div style={styles.card}>

<h2>Your Details</h2>

<input
style={styles.input}
placeholder="Name"
value={name}
onChange={e=>setName(e.target.value)}
/>

<input
style={styles.input}
placeholder="Phone"
value={phone}
onChange={e=>setPhone(e.target.value)}
/>

<button style={styles.btn} onClick={()=>done({name,phone})}>
Continue → </button>

</div>

</motion.div>

);
}

function Dashboard({
user,messages,stats,
sender,text,setSender,setText,
classify,deleteMsg
}){

return(

<motion.div {...pageMotion} style={styles.container}>

<h2>{greet()}, {user.name}</h2>

<div style={styles.grid}>

<Card label="Critical" value={stats.CRITICAL||0}/>
<Card label="Important" value={stats.IMPORTANT||0}/>
<Card label="Spam" value={stats.SPAM||0}/>

</div>

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
placeholder="Paste message"
value={text}
onChange={e=>setText(e.target.value)}
/>

<button style={styles.btn} onClick={classify}>
Classify
</button>

</div>

<div style={styles.card}>

<h3>Messages</h3>

{messages.map(m=>(
<div key={m.id} style={styles.msg}>

<div>
<strong>{m.sender}</strong>
<div style={{opacity:.7,fontSize:14}}>
{m.text}
</div>
</div>

<div style={{
...styles.badge,
background:colors[m.category]
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

</motion.div>

);
}

function Card({label,value}){
return(
<div style={styles.stat}>
<div style={{opacity:.6}}>{label}</div>
<div style={{fontSize:24,fontWeight:700}}>{value}</div>
</div>
);
}

const styles={

page:{
minHeight:"100vh",
background:"radial-gradient(circle at top left,#0f172a,#020617)",
color:"#e5e7eb",
fontFamily:"Inter"
},

center:{
height:"100vh",
display:"flex",
alignItems:"center",
justifyContent:"center"
},

logo:{
fontFamily:"Playfair Display",
fontSize:64,
letterSpacing:4
},

tagline:{
opacity:.7,
marginBottom:40
},

btn:{
padding:"10px 18px",
background:"#38bdf8",
border:"none",
borderRadius:8,
cursor:"pointer"
},

card:{
background:"rgba(15,23,42,0.6)",
padding:20,
borderRadius:16,
border:"1px solid rgba(255,255,255,.08)",
marginBottom:20
},

container:{
maxWidth:1000,
margin:"auto",
padding:20
},

grid:{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
gap:20,
marginBottom:20
},

stat:{
background:"rgba(15,23,42,0.6)",
padding:20,
borderRadius:16
},

input:{
width:"100%",
padding:10,
marginTop:10,
borderRadius:8,
border:"1px solid rgba(255,255,255,.1)",
background:"#020617",
color:"#fff"
},

msg:{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginTop:12
},

badge:{
padding:"4px 8px",
borderRadius:6,
fontSize:12
},

delete:{
border:"none",
background:"transparent",
color:"#ef4444",
cursor:"pointer"
},

roleGrid:{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:14,
marginTop:20
},

role:{
background:"rgba(255,255,255,.05)",
padding:20,
borderRadius:12,
textAlign:"center",
cursor:"pointer"
}

};
