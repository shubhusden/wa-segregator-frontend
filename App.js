import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, RotateCcw } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API = "https://wa-segregator-backend.onrender.com/api";

const COLORS = {
  CRITICAL: "#ff4d4d",
  IMPORTANT: "#f9a825",
  CASUAL: "#42a5f5",
  NON_IMPORTANT: "#9e9e9e",
  SPAM: "#ab47bc",
  FAKE: "#26c6da",
};

export default function App() {

  const saved = JSON.parse(localStorage.getItem("priion_user"));

  const [step, setStep] = useState(saved ? "dashboard" : "intro");
  const [role, setRole] = useState(saved?.role || "");
  const [user, setUser] = useState(saved || null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [messages, setMessages] = useState([]);
  const [sender, setSender] = useState("");
  const [text, setText] = useState("");
  const [stats, setStats] = useState({});

  const pageAnim = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -40 },
    transition: { duration: 0.4 },
  };

  useEffect(() => {
    if (step === "dashboard") loadStats();
  }, [step]);

  const loadStats = async () => {
    try {
      const res = await fetch(`${API}/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.log(err);
    }
  };

  const classify = async () => {

    if (!text) return;

    const res = await fetch(`${API}/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender, text }),
    });

    const data = await res.json();

    setMessages([data, ...messages]);

    loadStats();

    setText("");
    setSender("");
  };

  const resetProfile = () => {
    localStorage.removeItem("priion_user");
    window.location.reload();
  };

  const saveProfile = () => {

    const data = { name, phone, role };

    localStorage.setItem("priion_user", JSON.stringify(data));

    setUser(data);

    setStep("dashboard");
  };

  const chartData = Object.keys(stats || {}).map((k) => ({
    name: k,
    value: stats[k],
  }));

  return (
    <div style={styles.container}>

      <AnimatePresence mode="wait">

        {step === "intro" && (
          <motion.div key="intro" {...pageAnim} style={styles.center}>
            <h1 style={styles.title}>PRIION</h1>
            <p style={styles.subtitle}>Prioritise What Matters</p>
            <button style={styles.button} onClick={() => setStep("role")}>
              Enter
            </button>
          </motion.div>
        )}

        {step === "role" && (
          <motion.div key="role" {...pageAnim} style={styles.center}>
            <h2>Select your role</h2>

            {["Student", "Teacher", "Business", "Corporate"].map((r) => (
              <button
                key={r}
                style={styles.roleButton}
                onClick={() => {
                  setRole(r);
                  setStep("profile");
                }}
              >
                {r}
              </button>
            ))}
          </motion.div>
        )}

        {step === "profile" && (
          <motion.div key="profile" {...pageAnim} style={styles.center}>
            <h2>Welcome to PRIION</h2>

            <input
              style={styles.input}
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Mobile"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button style={styles.button} onClick={saveProfile}>
              Continue
            </button>
          </motion.div>
        )}

        {step === "dashboard" && (
          <motion.div key="dash" {...pageAnim} style={styles.dashboard}>

            <div style={styles.header}>
              <div>
                <h1>PRIION</h1>
                <p>{user?.name}</p>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={loadStats} style={styles.iconBtn}>
                  <RefreshCw size={16} />
                </button>

                <button onClick={resetProfile} style={styles.iconBtn}>
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            <div style={styles.cards}>

              {["CRITICAL", "IMPORTANT", "SPAM"].map((c) => (
                <div key={c} style={styles.card}>
                  <h3>{c}</h3>
                  <h2>{stats[c] || 0}</h2>
                </div>
              ))}

            </div>

            <div style={styles.classifyBox}>

              <h3>Classify Message</h3>

              <input
                style={styles.input}
                placeholder="Sender"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
              />

              <textarea
                style={styles.textarea}
                placeholder="Paste WhatsApp message"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              <button style={styles.button} onClick={classify}>
                Classify
              </button>

            </div>

            <div style={styles.chartBox}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData} dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[entry.name] || "#888"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.messages}>

              <h3>Messages</h3>

              {messages.length === 0 && <p>No messages yet</p>}

              {messages.map((m, i) => (
                <div key={i} style={styles.msg}>
                  <b>{m.category}</b>
                  <p>{m.text}</p>
                </div>
              ))}

            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

const styles = {

  container: {
    minHeight: "100vh",
    background: "#050b1a",
    color: "white",
    fontFamily: "sans-serif",
  },

  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    gap: 20,
  },

  title: {
    fontSize: 60,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 18,
    opacity: 0.7,
  },

  button: {
    padding: "10px 20px",
    background: "#42a5f5",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
  },

  roleButton: {
    padding: 12,
    width: 200,
    borderRadius: 10,
    background: "#111c3a",
    border: "1px solid #2c3f66",
    color: "white",
    cursor: "pointer",
  },

  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #333",
    width: 250,
  },

  textarea: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #333",
    width: "100%",
    height: 120,
  },

  dashboard: {
    padding: 30,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconBtn: {
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "#1b2c52",
    color: "white",
    cursor: "pointer",
  },

  cards: {
    display: "flex",
    gap: 20,
    marginTop: 20,
  },

  card: {
    padding: 20,
    borderRadius: 12,
    background: "#0f1a38",
    width: 150,
  },

  classifyBox: {
    marginTop: 30,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  chartBox: {
    marginTop: 40,
  },

  messages: {
    marginTop: 40,
  },

  msg: {
    padding: 10,
    borderBottom: "1px solid #333",
  },

};
