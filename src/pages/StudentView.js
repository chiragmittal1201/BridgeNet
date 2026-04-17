import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";

function StudentView() {
  const [alumni, setAlumni] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const snap = await getDocs(collection(db, "users"));
    const allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setAlumni(allUsers.filter(u => u.role === "alumni" && u.verified));
    const q = query(collection(db, "engagements"), where("studentId", "==", auth.currentUser.uid));
    const reqSnap = await getDocs(q);
    setRequests(reqSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const sendRequest = async (alumniId) => {
    const already = requests.find(r => r.alumniId === alumniId);
    if (already) { setFeedback("Already sent a request to this alumni!"); setTimeout(() => setFeedback(""), 3000); return; }
    await addDoc(collection(db, "engagements"), { alumniId, studentId: auth.currentUser.uid, message, status:"pending", createdAt:new Date() });
    setMessage("");
    setSelectedAlumni(null);
    setFeedback("Request sent successfully!");
    setTimeout(() => setFeedback(""), 3000);
    fetchData();
  };

  const getRequest = (alumniId) => requests.find(r => r.alumniId === alumniId);

  const filtered = alumni.filter(a =>
    (a.name||"").toLowerCase().includes(search.toLowerCase()) ||
    (a.company||"").toLowerCase().includes(search.toLowerCase()) ||
    (a.branch||"").toLowerCase().includes(search.toLowerCase()) ||
    (a.batch||"").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{minHeight:"100vh",backgroundColor:"#f5f7ff"}}>
      {/* Navbar */}
      <div style={{background:"linear-gradient(135deg, #1a237e, #1565c0)",color:"white",padding:"0 32px",display:"flex",justifyContent:"space-between",alignItems:"center",height:"64px",boxShadow:"0 2px 12px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <span style={{fontSize:"24px"}}>🎓</span>
          <div>
            <div style={{fontWeight:"700",fontSize:"18px"}}>BridgeNet</div>
            <div style={{fontSize:"11px",opacity:0.8}}>Alumni Directory</div>
          </div>
        </div>
        <button onClick={() => signOut(auth)} style={{background:"rgba(255,255,255,0.15)",color:"white",border:"1px solid rgba(255,255,255,0.3)",padding:"8px 18px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"14px"}}>
          Logout
        </button>
      </div>

      <div style={{maxWidth:"1100px",margin:"32px auto",padding:"0 16px"}}>
        {/* Header + Search */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px",flexWrap:"wrap",gap:"16px"}}>
          <div>
            <h2 style={{margin:"0 0 4px",color:"#1a237e",fontSize:"22px",fontWeight:"700"}}>Alumni Directory</h2>
            <p style={{margin:0,color:"#666",fontSize:"14px"}}>{alumni.length} verified alumni available</p>
          </div>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search by name, company, branch..."
            style={{padding:"11px 16px",border:"2px solid #e8eaf6",borderRadius:"8px",fontSize:"14px",width:"300px",outline:"none",boxSizing:"border-box"}}
            onFocus={e => e.target.style.border="2px solid #1a237e"}
            onBlur={e => e.target.style.border="2px solid #e8eaf6"} />
        </div>

        {feedback && <div style={{background:"#e8f5e9",color:"#2e7d32",padding:"12px",borderRadius:"8px",marginBottom:"16px",textAlign:"center",fontWeight:"600",fontSize:"14px"}}>✓ {feedback}</div>}

        {loading ? <p style={{textAlign:"center",color:"#666"}}>Loading...</p> :
          filtered.length === 0 ?
          <div style={{background:"white",borderRadius:"16px",padding:"60px",textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:"48px",marginBottom:"12px"}}>🔍</div>
            <p style={{color:"#666",fontSize:"16px"}}>{alumni.length === 0 ? "No verified alumni available yet." : "No alumni match your search."}</p>
          </div> :
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"20px"}}>
            {filtered.map(a => {
              const req = getRequest(a.id);
              return (
                <div key={a.id} style={{background:"white",borderRadius:"16px",boxShadow:"0 4px 16px rgba(0,0,0,0.08)",overflow:"hidden",transition:"transform 0.2s,box-shadow 0.2s"}}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"; }}>
                  {/* Card Header */}
                  <div style={{background:"linear-gradient(135deg,#1a237e,#1565c0)",padding:"20px",color:"white"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                      <div style={{width:"48px",height:"48px",borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",fontWeight:"700"}}>
                        {(a.name||"A").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontWeight:"700",fontSize:"16px"}}>{a.name||"Alumni"}</div>
                        <div style={{fontSize:"13px",opacity:0.85}}>{a.role||""} {a.company ? `at ${a.company}` : ""}</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{padding:"16px 20px"}}>
                    <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"12px"}}>
                      {a.batch && <span style={{padding:"4px 10px",background:"#e8eaf6",color:"#1a237e",borderRadius:"20px",fontSize:"12px",fontWeight:"600"}}>Batch {a.batch}</span>}
                      {a.branch && <span style={{padding:"4px 10px",background:"#e8eaf6",color:"#1a237e",borderRadius:"20px",fontSize:"12px",fontWeight:"600"}}>{a.branch}</span>}
                    </div>

                    {a.bio && <p style={{margin:"0 0 16px",color:"#555",fontSize:"13px",lineHeight:"1.5",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{a.bio}</p>}

                    {req ? (
                      <div>
                        <div style={{padding:"10px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600",textAlign:"center",
                          background:req.status==="accepted"?"#e8f5e9":req.status==="rejected"?"#ffebee":"#fff3e0",
                          color:req.status==="accepted"?"#2e7d32":req.status==="rejected"?"#c62828":"#e65100"}}>
                          {req.status==="accepted"?"✓ Request Accepted":req.status==="rejected"?"✗ Request Rejected":"⏳ Request Pending"}
                        </div>
                        {req.status==="accepted" && (
                          <div style={{marginTop:"12px",background:"#f5f7ff",padding:"12px",borderRadius:"8px",border:"1px solid #e8eaf6"}}>
                            <p style={{margin:"0 0 6px",fontSize:"13px",color:"#1a237e",fontWeight:"700"}}>📬 Contact Details</p>
                            <p style={{margin:"0 0 4px",fontSize:"13px",color:"#333"}}>✉ {a.email}</p>
                            {a.linkedin && <a href={a.linkedin} target="_blank" rel="noreferrer" style={{fontSize:"13px",color:"#1565c0",fontWeight:"600",textDecoration:"none"}}>🔗 LinkedIn Profile →</a>}
                          </div>
                        )}
                      </div>
                    ) : (
                      selectedAlumni === a.id ? (
                        <div>
                          <textarea value={message} onChange={e => setMessage(e.target.value)}
                            placeholder="Introduce yourself and explain why you'd like to connect..." rows={3}
                            style={{width:"100%",padding:"10px",border:"2px solid #e8eaf6",borderRadius:"8px",fontSize:"13px",boxSizing:"border-box",marginBottom:"10px",resize:"none",outline:"none",fontFamily:"inherit"}}
                            onFocus={e => e.target.style.border="2px solid #1a237e"}
                            onBlur={e => e.target.style.border="2px solid #e8eaf6"} />
                          <div style={{display:"flex",gap:"8px"}}>
                            <button onClick={() => sendRequest(a.id)} style={{flex:1,padding:"9px",background:"linear-gradient(135deg,#1a237e,#1565c0)",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"700",fontSize:"13px"}}>Send Request</button>
                            <button onClick={() => setSelectedAlumni(null)} style={{flex:1,padding:"9px",background:"#f5f5f5",color:"#333",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"13px"}}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setSelectedAlumni(a.id)}
                          style={{width:"100%",padding:"10px",background:"linear-gradient(135deg,#1a237e,#1565c0)",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"13px"}}>
                          🤝 Request Engagement
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        }
      </div>
    </div>
  );
}

export default StudentView;