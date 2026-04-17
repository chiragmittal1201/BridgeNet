import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function AlumniProfile() {
  const [profile, setProfile] = useState({ name:"", batch:"", branch:"", company:"", role:"", linkedin:"", bio:"" });
  const [saved, setSaved] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile({ name:data.name||"", batch:data.batch||"", branch:data.branch||"", company:data.company||"", role:data.role||"", linkedin:data.linkedin||"", bio:data.bio||"" });
        setVerified(data.verified || false);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    await setDoc(doc(db, "users", auth.currentUser.uid), { ...profile, role:"alumni", email:auth.currentUser.email }, { merge:true });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const fields = [
    { key:"name", label:"Full Name", placeholder:"Your full name", icon:"👤" },
    { key:"batch", label:"Batch Year", placeholder:"e.g. 2020", icon:"📅" },
    { key:"branch", label:"Branch / Department", placeholder:"e.g. Computer Science", icon:"🏫" },
    { key:"company", label:"Current Company", placeholder:"Where you work now", icon:"🏢" },
    { key:"role", label:"Current Role", placeholder:"Your job title", icon:"💼" },
    { key:"linkedin", label:"LinkedIn URL", placeholder:"https://linkedin.com/in/...", icon:"🔗" },
  ];

  if (loading) return <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh"}}>Loading...</div>;

  return (
    <div style={{minHeight:"100vh",backgroundColor:"#f5f7ff"}}>
      {/* Navbar */}
      <div style={{background:"linear-gradient(135deg, #1a237e, #1565c0)",color:"white",padding:"0 32px",display:"flex",justifyContent:"space-between",alignItems:"center",height:"64px",boxShadow:"0 2px 12px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <span style={{fontSize:"24px"}}>🎓</span>
          <div>
            <div style={{fontWeight:"700",fontSize:"18px"}}>BridgeNet</div>
            <div style={{fontSize:"11px",opacity:0.8}}>Alumni Portal</div>
          </div>
        </div>
        <div style={{display:"flex",gap:"12px"}}>
          <button onClick={() => navigate("/alumni-requests")} style={{background:"rgba(255,255,255,0.15)",color:"white",border:"1px solid rgba(255,255,255,0.3)",padding:"8px 18px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"14px"}}>
            📬 My Requests
          </button>
          <button onClick={() => signOut(auth)} style={{background:"rgba(255,255,255,0.15)",color:"white",border:"1px solid rgba(255,255,255,0.3)",padding:"8px 18px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"14px"}}>
            Logout
          </button>
        </div>
      </div>

      <div style={{maxWidth:"680px",margin:"32px auto",padding:"0 16px"}}>
        {/* Status Banner */}
        <div style={{background:verified?"linear-gradient(135deg,#2e7d32,#388e3c)":"linear-gradient(135deg,#e65100,#f57c00)",borderRadius:"12px",padding:"16px 24px",marginBottom:"24px",display:"flex",alignItems:"center",gap:"12px",color:"white",boxShadow:"0 4px 12px rgba(0,0,0,0.15)"}}>
          <span style={{fontSize:"28px"}}>{verified?"✅":"⏳"}</span>
          <div>
            <div style={{fontWeight:"700",fontSize:"16px"}}>{verified?"Account Verified":"Pending Verification"}</div>
            <div style={{fontSize:"13px",opacity:0.9}}>{verified?"Your profile is visible to students":"Admin will review and verify your account"}</div>
          </div>
        </div>

        {/* Profile Card */}
        <div style={{background:"white",borderRadius:"16px",boxShadow:"0 4px 20px rgba(0,0,0,0.08)",padding:"32px"}}>
          <h2 style={{margin:"0 0 24px",color:"#1a237e",fontSize:"20px",fontWeight:"700"}}>My Profile</h2>

          {saved && <div style={{background:"#e8f5e9",color:"#2e7d32",padding:"12px",borderRadius:"8px",marginBottom:"20px",textAlign:"center",fontWeight:"600"}}>✓ Profile saved successfully!</div>}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"16px"}}>
            {fields.map(f => (
              <div key={f.key} style={{gridColumn:f.key==="name"||f.key==="linkedin"?"span 2":"span 1"}}>
                <label style={{display:"block",marginBottom:"6px",color:"#333",fontWeight:"600",fontSize:"13px"}}>{f.icon} {f.label}</label>
                <input type="text" value={profile[f.key]} onChange={e => setProfile({...profile,[f.key]:e.target.value})} placeholder={f.placeholder}
                  style={{width:"100%",padding:"11px",border:"2px solid #e8eaf6",borderRadius:"8px",fontSize:"14px",boxSizing:"border-box",outline:"none"}}
                  onFocus={e => e.target.style.border="2px solid #1a237e"}
                  onBlur={e => e.target.style.border="2px solid #e8eaf6"} />
              </div>
            ))}
          </div>

          <div style={{marginBottom:"24px"}}>
            <label style={{display:"block",marginBottom:"6px",color:"#333",fontWeight:"600",fontSize:"13px"}}>📝 Bio</label>
            <textarea value={profile.bio} onChange={e => setProfile({...profile,bio:e.target.value})} placeholder="Tell students about your journey, expertise, and how you can help them..." rows={4}
              style={{width:"100%",padding:"11px",border:"2px solid #e8eaf6",borderRadius:"8px",fontSize:"14px",boxSizing:"border-box",resize:"vertical",outline:"none",fontFamily:"inherit"}}
              onFocus={e => e.target.style.border="2px solid #1a237e"}
              onBlur={e => e.target.style.border="2px solid #e8eaf6"} />
          </div>

          <button onClick={handleSave}
            style={{width:"100%",padding:"13px",background:"linear-gradient(135deg, #1a237e, #1565c0)",color:"white",border:"none",borderRadius:"8px",fontSize:"16px",cursor:"pointer",fontWeight:"600",letterSpacing:"0.5px"}}>
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlumniProfile;