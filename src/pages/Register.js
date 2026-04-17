import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");
    if (!email || !password || !name) { setError("All fields are required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", result.user.uid), {
        email, name, role,
        verified: role === "student" ? true : false,
        createdAt: new Date()
      });
      navigate("/");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setError("Email already registered.");
      else setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)"}}>
      <div style={{background:"white",padding:"48px 40px",borderRadius:"16px",boxShadow:"0 20px 60px rgba(0,0,0,0.3)",width:"400px"}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <div style={{width:"64px",height:"64px",backgroundColor:"#1a237e",borderRadius:"16px",display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:"16px"}}>
            <span style={{color:"white",fontSize:"28px"}}>🎓</span>
          </div>
          <h1 style={{margin:"0 0 4px",color:"#1a237e",fontSize:"28px",fontWeight:"700"}}>BridgeNet</h1>
          <p style={{margin:0,color:"#666",fontSize:"14px"}}>Create your account</p>
        </div>

        {error && <div style={{background:"#ffebee",color:"#c62828",padding:"12px",borderRadius:"8px",marginBottom:"20px",fontSize:"14px",textAlign:"center"}}>{error}</div>}

        <div style={{marginBottom:"16px"}}>
          <label style={{display:"block",marginBottom:"6px",color:"#333",fontWeight:"600",fontSize:"14px"}}>Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            style={{width:"100%",padding:"12px",border:"2px solid #e8eaf6",borderRadius:"8px",fontSize:"14px",boxSizing:"border-box",outline:"none"}}
            onFocus={e => e.target.style.border="2px solid #1a237e"}
            onBlur={e => e.target.style.border="2px solid #e8eaf6"}
            placeholder="Enter your full name" />
        </div>

        <div style={{marginBottom:"16px"}}>
          <label style={{display:"block",marginBottom:"6px",color:"#333",fontWeight:"600",fontSize:"14px"}}>Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            style={{width:"100%",padding:"12px",border:"2px solid #e8eaf6",borderRadius:"8px",fontSize:"14px",boxSizing:"border-box",outline:"none"}}
            onFocus={e => e.target.style.border="2px solid #1a237e"}
            onBlur={e => e.target.style.border="2px solid #e8eaf6"}
            placeholder="Enter your email" />
        </div>

        <div style={{marginBottom:"16px"}}>
          <label style={{display:"block",marginBottom:"6px",color:"#333",fontWeight:"600",fontSize:"14px"}}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            style={{width:"100%",padding:"12px",border:"2px solid #e8eaf6",borderRadius:"8px",fontSize:"14px",boxSizing:"border-box",outline:"none"}}
            onFocus={e => e.target.style.border="2px solid #1a237e"}
            onBlur={e => e.target.style.border="2px solid #e8eaf6"}
            placeholder="Minimum 6 characters" />
        </div>

        <div style={{marginBottom:"28px"}}>
          <label style={{display:"block",marginBottom:"8px",color:"#333",fontWeight:"600",fontSize:"14px"}}>I am joining as</label>
          <div style={{display:"flex",gap:"12px"}}>
            {["student","alumni"].map(r => (
              <div key={r} onClick={() => setRole(r)}
                style={{flex:1,padding:"12px",border:`2px solid ${role===r?"#1a237e":"#e8eaf6"}`,borderRadius:"8px",cursor:"pointer",textAlign:"center",backgroundColor:role===r?"#e8eaf6":"white",transition:"all 0.2s"}}>
                <div style={{fontSize:"20px",marginBottom:"4px"}}>{r==="student"?"📚":"🏆"}</div>
                <div style={{fontSize:"13px",fontWeight:"600",color:role===r?"#1a237e":"#666",textTransform:"capitalize"}}>{r}</div>
              </div>
            ))}
          </div>
          {role === "alumni" && <p style={{margin:"8px 0 0",fontSize:"12px",color:"#e65100",textAlign:"center"}}>⏳ Alumni accounts require admin verification</p>}
        </div>

        <button onClick={handleRegister} disabled={loading}
          style={{width:"100%",padding:"13px",background:loading?"#9fa8da":"linear-gradient(135deg, #1a237e, #1565c0)",color:"white",border:"none",borderRadius:"8px",fontSize:"16px",cursor:loading?"not-allowed":"pointer",fontWeight:"600",letterSpacing:"0.5px"}}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p style={{textAlign:"center",color:"#666",fontSize:"14px",marginTop:"20px",marginBottom:0}}>
          Already have an account?{" "}
          <span onClick={() => navigate("/")} style={{color:"#1a237e",cursor:"pointer",fontWeight:"700"}}>Sign In</span>
        </p>
      </div>
    </div>
  );
}

export default Register;