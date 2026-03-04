import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, RotateCcw, User, MessageCircle } from "lucide-react";
import {
PieChart,
Pie,
Cell,
Tooltip,
ResponsiveContainer
} from "recharts";

/* =====================================================
CONFIG
===================================================== */

const API = "https://wa-segregator-backend.onrender.com/api";

const CATEGORY_COLORS = {
CRITICAL: "#ef4444",
IMPORTANT: "#f97316",
CASUAL: "#22c55e",
NON_IMPORTANT: "#94a3b8",
SPAM: "#a855f7",
FAKE: "#ec4899"
};

const ROLES = [
{ id: "student", label: "Student", icon: "🎓" },
{ id: "teacher", label: "Teacher", icon: "📚" },
{ id: "business", label: "Business", icon: "💼" },
{ id: "corporate", label: "Corporate", icon: "🏢" }
];

/* =====================================================
UTILS
===================================================== */

function greeting() {
const h = new Date().getHours();
if (h < 12) return "Good Morning";
if (h < 18) return "Good Afternoon";
return "Good Evening";
}

/* =====================================================
PAGE MOTION
===================================================== */

const pageMotion = {
initial: { opacity: 0, y: 40, scale: 0.97 },
animate: { opacity: 1, y: 0, scale: 1 },
exit: { opacity: 0, y: -40, scale: 0.97 },
transition: { duration: 0.4 }
};

/* =====================================================
ROOT APP
===================================================== */

export default function App() {

const saved = JSON.parse(localStorage.getItem("priion_user"));

const [step, setStep] = useState("intro");
const [user, setUser] = useState(saved || null);
const [role, setRole] = useState(saved?.role || null);

const [messages, setMessages] = useState([]);
const [stats, setStats] = useState({});

const [sender, setSender] = useState("");
const [text, setText] = useState("");

const [installPrompt, setInstallPrompt] = useState(null);

/* =========================
LOAD DATA
========================= */

async function loadData() {
try {
const m = await fetch(API + "/messages").then(r => r.json());
const s = await fetch(API + "/stats").then(r => r.json());

```
  setMessages(m);
  setStats(s);
} catch {}
```

}

useEffect(() => {
if (step === "dashboard") loadData();
}, [step]);

/* =========================
INSTALL PROMPT
========================= */

useEffect(() => {
window.addEventListener("beforeinstallprompt", e => {
e.preventDefault();
setInstallPrompt(e);
});
}, []);

async function installApp() {
if (!installPrompt) return;
installPrompt.prompt();
await installPrompt.userChoice;
}

/* =========================
MESSAGE CLASSIFY
========================= */

async function classify() {
if (!text.trim()) return;

```
const msg = await fetch(API + "/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sender: sender || "You",
    text
  })
}).then(r => r.json());

setMessages(prev => [msg, ...prev]);
setText("");
loadData();
```

}

async function deleteMsg(id) {
await fetch(API + "/messages/" + id, { method: "DELETE" });
loadData();
}

function saveProfile(data) {
const full = { ...data, role };

```
localStorage.setItem("priion_user", JSON.stringify(full));
setUser(full);
setStep("dashboard");
```

}

function refresh() {
loadData();
}

function resetProfile() {
localStorage.removeItem("priion_user");
window.location.reload();
}

/* =========================
RENDER
========================= */

return ( <div style={styles.page}>

```
  <AnimatePresence mode="wait">

    {step === "welcome" && (
      <Welcome key="welcome" next={() => setStep("role")} />
    )}

    {step === "role" && (
      <RoleSelect key="role" choose={(r) => {
        setRole(r);
        setStep("profile");
      }} />
    )}

    {step === "profile" && (
      <Profile key="profile" done={saveProfile} />
    )}

    {step === "dashboard" && (
      <Dashboard
        key="dashboard"
        user={user}
        messages={messages}
        stats={stats}
        sender={sender}
        text={text}
        setSender={setSender}
        setText={setText}
        classify={classify}
        deleteMsg={deleteMsg}
        refresh={refresh}
        resetProfile={resetProfile}
        installApp={installApp}
      />
    )}

  </AnimatePresence>

</div>
```

);
}

/* =====================================================
WELCOME PAGE
===================================================== */

function Welcome({ next }) {

return (
<motion.div {...pageMotion} style={styles.center}>

```
  <div style={{ textAlign: "center" }}>

    <div style={styles.brand}>PRIION</div>

    <div style={styles.tagline}>
      Prioritise What Matters
    </div>

    <button style={styles.primaryBtn} onClick={next}>
      Enter →
    </button>

  </div>

</motion.div>
```

);
}

/* =====================================================
ROLE SELECT
===================================================== */

function RoleSelect({ choose }) {

return (
<motion.div {...pageMotion} style={styles.center}>

```
  <div style={styles.cardLarge}>

    <h2>Select your role</h2>

    <div style={styles.roleGrid}>

      {ROLES.map(r => (

        <div
          key={r.id}
          style={styles.roleCard}
          onClick={() => choose(r.id)}
        >

          <div style={{ fontSize: 28 }}>{r.icon}</div>
          <div>{r.label}</div>

        </div>

      ))}

    </div>

  </div>

</motion.div>
```

);
}

/* =====================================================
PROFILE
===================================================== */

function Profile({ done }) {

const [name, setName] = useState("");
const [phone, setPhone] = useState("");

return (
<motion.div {...pageMotion} style={styles.center}>

```
  <div style={styles.cardLarge}>

    <h2>Create Profile</h2>

    <input
      style={styles.input}
      placeholder="Name"
      value={name}
      onChange={e => setName(e.target.value)}
    />

    <input
      style={styles.input}
      placeholder="Phone Number"
      value={phone}
      onChange={e => setPhone(e.target.value)}
    />

    <button
      style={styles.primaryBtn}
      onClick={() => done({ name, phone })}
    >
      Continue →
    </button>

  </div>

</motion.div>
```

);
}

/* =====================================================
DASHBOARD
===================================================== */

function Dashboard({
user,
messages,
stats,
sender,
text,
setSender,
setText,
classify,
deleteMsg,
refresh,
resetProfile,
installApp
}) {

const chartData = Object.keys(stats || {}).map(k => ({
name: k,
value: stats[k]
}));

return (
<motion.div {...pageMotion} style={styles.container}>

```
  {/* TOP BAR */}

  <div style={styles.topbar}>

    <div>
      <h2>PRIION</h2>
      <div style={{ opacity: .6 }}>
        {greeting()}, {user?.name}
      </div>
    </div>

    <div style={{ display: "flex", gap: 10 }}>

      <button style={styles.iconBtn} onClick={refresh}>
        <RefreshCw size={16} /> Refresh
      </button>

      <button style={styles.iconBtn} onClick={resetProfile}>
        <RotateCcw size={16} /> Reset
      </button>

      <button style={styles.iconBtn} onClick={installApp}>
        Install
      </button>

    </div>

  </div>

  {/* STATS */}

  <div style={styles.grid3}>

    {Object.entries(stats || {}).map(([k, v]) => (
      <div key={k} style={styles.statCard}>
        <div>{k}</div>
        <div style={styles.statValue}>{v}</div>
      </div>
    ))}

  </div>

  {/* CHART */}

  <div style={styles.cardLarge}>

    <h3>Analytics</h3>

    <div style={{ height: 250 }}>

      <ResponsiveContainer>

        <PieChart>

          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
          >

            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={CATEGORY_COLORS[entry.name]}
              />
            ))}

          </Pie>

          <Tooltip />

        </PieChart>

      </ResponsiveContainer>

    </div>

  </div>

  {/* MESSAGE INPUT */}

  <div style={styles.cardLarge}>

    <h3>Classify Message</h3>

    <input
      style={styles.input}
      placeholder="Sender"
      value={sender}
      onChange={e => setSender(e.target.value)}
    />

    <textarea
      style={styles.input}
      placeholder="Paste WhatsApp message"
      value={text}
      onChange={e => setText(e.target.value)}
    />

    <button style={styles.primaryBtn} onClick={classify}>
      Classify
    </button>

  </div>

  {/* MESSAGE LIST */}

  <div style={styles.cardLarge}>

    <h3>Messages</h3>

    {messages.map(m => (

      <div key={m.id} style={styles.message}>

        <div>
          <strong>{m.sender}</strong>
          <div style={{ opacity: .7 }}>
            {m.text}
          </div>
        </div>

        <div
          style={{
            ...styles.badge,
            background: CATEGORY_COLORS[m.category]
          }}
        >
          {m.category}
        </div>

        <button
          style={styles.deleteBtn}
          onClick={() => deleteMsg(m.id)}
        >
          Delete
        </button>

      </div>

    ))}

  </div>

</motion.div>
```

);
}

/* =====================================================
STYLES
===================================================== */

const styles = {

page: {
minHeight: "100vh",
background: "radial-gradient(circle at top left,#0f172a,#020617)",
color: "#e5e7eb",
fontFamily: "Inter, sans-serif",
padding: 20
},

center: {
height: "100vh",
display: "flex",
justifyContent: "center",
alignItems: "center"
},

brand: {
fontFamily: "Playfair Display, serif",
fontSize: 60,
letterSpacing: 4
},

tagline: {
opacity: .7,
marginBottom: 40
},

container: {
maxWidth: 1100,
margin: "auto"
},

topbar: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
marginBottom: 20
},

iconBtn: {
display: "flex",
alignItems: "center",
gap: 6,
padding: "8px 12px",
borderRadius: 8,
border: "none",
background: "#1e293b",
color: "white",
cursor: "pointer"
},

grid3: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
gap: 16,
marginBottom: 20
},

statCard: {
background: "#1e293b",
padding: 20,
borderRadius: 12
},

statValue: {
fontSize: 24,
fontWeight: 700
},

cardLarge: {
background: "rgba(15,23,42,0.6)",
backdropFilter: "blur(16px)",
border: "1px solid rgba(255,255,255,.08)",
borderRadius: 16,
padding: 20,
marginBottom: 20
},

primaryBtn: {
marginTop: 12,
padding: "10px 18px",
background: "#38bdf8",
border: "none",
borderRadius: 8,
cursor: "pointer"
},

input: {
width: "100%",
marginTop: 10,
padding: 10,
borderRadius: 8,
border: "1px solid rgba(255,255,255,.1)",
background: "#020617",
color: "#fff"
},

message: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
marginTop: 12
},

badge: {
padding: "4px 8px",
borderRadius: 6,
fontSize: 12
},

deleteBtn: {
border: "none",
background: "transparent",
color: "#ef4444",
cursor: "pointer"
},

roleGrid: {
display: "grid",
gridTemplateColumns: "repeat(2,1fr)",
gap: 14,
marginTop: 20
},

roleCard: {
background: "rgba(255,255,255,.05)",
padding: 20,
borderRadius: 12,
textAlign: "center",
cursor: "pointer"
}

};
