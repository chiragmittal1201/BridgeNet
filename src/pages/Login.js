import { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", result.user.uid));
      if (!snap.exists()) setError("User profile not found. Contact admin.");
    } catch (err) {
      if (err.code === "auth/invalid-credential") setError("Invalid email or password.");
      else if (err.code === "auth/user-not-found") setError("No account found.");
      else if (err.code === "auth/wrong-password") setError("Incorrect password.");
      else setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)"}}>
      <div style={{background:"white",padding:"48px 40px",borderRadius:"16px",boxShadow:"0 20px 60px rgba(0,0,0,0.3)",width:"380px"}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <div style={{width:"64px",height:"64px",backgroundColor:"#1a237e",borderRadius:"16px",display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:"16px"}}>
            <span style={{color:"white",fontSize:"28px"}}>🎓</span>
          </div>
          <h1 style={{margin:"0 0 4px",color:"#1a237e",fontSize:"28px",fontWeight:"700"}}>BridgeNet</h1>
          <p style={{margin:0,color:"#666",fontSize:"14px"}}>College Alumni System</p>
        </div>

        {error && <div style={{background:"#ffebee",color:"#c62828",padding:"12px",borderRadius:"8px",marginBottom:"20px",fontSize:"14px",textAlign:"center"}}>{error}</div>}

        <div style={{marginBottom:"16px"}}>
          <label style={{display:"block",marginBottom:"6px",color:"#333",fontWeight:"600",fontSize:"14px"}}>Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            style={{width:"100%",padding:"12px",border:"2px solid #e8eaf6",borderRadius:"8px",fontSize:"14px",boxSizing:"border-box",outline:"none",transition:"border 0.2s"}}
            onFocus={e => e.target.style.border="2px solid #1a237e"}
            onBlur={e => e.target.style.border="2px solid #e8eaf6"}
            placeholder="Enter your email" />
        </div>

        <div style={{marginBottom:"28px"}}>
          <label style={{display:"block",marginBottom:"6px",color:"#333",fontWeight:"600",fontSize:"14px"}}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{width:"100%",padding:"12px",border:"2px solid #e8eaf6",borderRadius:"8px",fontSize:"14px",boxSizing:"border-box",outline:"none"}}
            onFocus={e => e.target.style.border="2px solid #1a237e"}
            onBlur={e => e.target.style.border="2px solid #e8eaf6"}
            placeholder="Enter your password" />
        </div>

        <button onClick={handleLogin} disabled={loading}
          style={{width:"100%",padding:"13px",background:loading?"#9fa8da":"linear-gradient(135deg, #1a237e, #1565c0)",color:"white",border:"none",borderRadius:"8px",fontSize:"16px",cursor:loading?"not-allowed":"pointer",fontWeight:"600",letterSpacing:"0.5px"}}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p style={{textAlign:"center",color:"#666",fontSize:"14px",marginTop:"20px",marginBottom:0}}>
          New to BridgeNet?{" "}
          <span onClick={() => navigate("/register")} style={{color:"#1a237e",cursor:"pointer",fontWeight:"700"}}>Create Account</span>
        </p>
      </div>
    </div>
  );
}

export default Login;