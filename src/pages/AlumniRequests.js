import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function AlumniRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const navigate = useNavigate();

  const fetchRequests = async () => {
    const q = query(collection(db, "engagements"), where("alumniId", "==", auth.currentUser.uid));
    const snap = await getDocs(q);
    const list = await Promise.all(snap.docs.map(async d => {
      const data = { id: d.id, ...d.data() };
      const studentSnap = await getDoc(doc(db, "users", data.studentId));
      data.studentName = studentSnap.exists() ? studentSnap.data().name || studentSnap.data().email : "Unknown";
      data.studentEmail = studentSnap.exists() ? studentSnap.data().email : "";
      return data;
    }));
    setRequests(list);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "engagements", id), { status });
    fetchRequests();
  };

  const filtered = requests.filter(r => r.status === activeTab);
  const counts = { pending: requests.filter(r=>r.status==="pending").length, accepted: requests.filter(r=>r.status==="accepted").length, rejected: requests.filter(r=>r.status==="rejected").length };

  return (
    <div style={{minHeight:"100vh",backgroundColor:"#f5f7ff"}}>
      {/* Navbar */}
      <div style={{background:"linear-gradient(135deg, #1a237e, #1565c0)",color:"white",padding:"0 32px",display:"flex",justifyContent:"space-between",alignItems:"center",height:"64px",boxShadow:"0 2px 12px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <span style={{fontSize:"24px"}}>🎓</span>
          <div>
            <div style={{fontWeight:"700",fontSize:"18px"}}>BridgeNet</div>
            <div style={{fontSize:"11px",opacity:0.8}}>Engagement Requests</div>
          </div>
        </div>
        <div style={{display:"flex",gap:"12px"}}>
          <button onClick={() => navigate("/alumni-profile")} style={{background:"rgba(255,255,255,0.15)",color:"white",border:"1px solid rgba(255,255,255,0.3)",padding:"8px 18px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"14px"}}>
            👤 My Profile
          </button>
          <button onClick={() => signOut(auth)} style={{background:"rgba(255,255,255,0.15)",color:"white",border:"1px solid rgba(255,255,255,0.3)",padding:"8px 18px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"14px"}}>
            Logout
          </button>
        </div>
      </div>

      <div style={{maxWidth:"800px",margin:"32px auto",padding:"0 16px"}}>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px",marginBottom:"24px"}}>
          {[{label:"Pending",count:counts.pending,color:"#e65100",bg:"#fff3e0",icon:"⏳"},
            {label:"Accepted",count:counts.accepted,color:"#2e7d32",bg:"#e8f5e9",icon:"✅"},
            {label:"Rejected",count:counts.rejected,color:"#c62828",bg:"#ffebee",icon:"❌"}].map(s => (
            <div key={s.label} style={{background:"white",padding:"20px",borderRadius:"12px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",textAlign:"center",borderTop:`4px solid ${s.color}`}}>
              <div style={{fontSize:"28px",marginBottom:"4px"}}>{s.icon}</div>
              <div style={{fontSize:"28px",fontWeight:"700",color:s.color}}>{s.count}</div>
              <div style={{fontSize:"13px",color:"#666"}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{background:"white",borderRadius:"12px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",overflow:"hidden"}}>
          <div style={{display:"flex",borderBottom:"1px solid #eee"}}>
            {["pending","accepted","rejected"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{flex:1,padding:"14px",border:"none",background:activeTab===tab?"#f5f7ff":"white",color:activeTab===tab?"#1a237e":"#666",fontWeight:activeTab===tab?"700":"400",fontSize:"14px",cursor:"pointer",borderBottom:activeTab===tab?"3px solid #1a237e":"3px solid transparent",textTransform:"capitalize"}}>
                {tab} ({counts[tab]})
              </button>
            ))}
          </div>

          <div style={{padding:"24px"}}>
            {loading ? <p style={{textAlign:"center",color:"#666"}}>Loading...</p> :
              filtered.length === 0 ?
              <div style={{textAlign:"center",padding:"48px 0"}}>
                <div style={{fontSize:"48px",marginBottom:"12px"}}>📭</div>
                <p style={{color:"#666",fontSize:"15px"}}>No {activeTab} requests</p>
              </div> :
              filtered.map(r => (
                <div key={r.id} style={{border:"1px solid #eee",borderRadius:"12px",padding:"20px",marginBottom:"16px",transition:"box-shadow 0.2s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"16px"}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
                        <div style={{width:"40px",height:"40px",borderRadius:"50%",background:"linear-gradient(135deg,#1a237e,#1565c0)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"700",fontSize:"16px"}}>
                          {r.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{fontWeight:"700",color:"#333",fontSize:"15px"}}>{r.studentName}</div>
                          <div style={{color:"#666",fontSize:"13px"}}>{r.studentEmail}</div>
                        </div>
                      </div>
                      {r.message && <div style={{background:"#f5f7ff",padding:"12px",borderRadius:"8px",fontSize:"14px",color:"#333",marginBottom:"12px"}}>
                        💬 {r.message}
                      </div>}
                      {r.status === "accepted" && <div style={{background:"#e8f5e9",padding:"10px 14px",borderRadius:"8px",fontSize:"13px",color:"#2e7d32",fontWeight:"600"}}>
                        ✓ Contact details shared with student
                      </div>}
                    </div>
                    {r.status === "pending" &&
                      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                        <button onClick={() => updateStatus(r.id,"accepted")} style={{padding:"9px 20px",backgroundColor:"#e8f5e9",color:"#2e7d32",border:"2px solid #a5d6a7",borderRadius:"8px",cursor:"pointer",fontWeight:"700",fontSize:"13px"}}>✓ Accept</button>
                        <button onClick={() => updateStatus(r.id,"rejected")} style={{padding:"9px 20px",backgroundColor:"#ffebee",color:"#c62828",border:"2px solid #ef9a9a",borderRadius:"8px",cursor:"pointer",fontWeight:"700",fontSize:"13px"}}>✗ Reject</button>
                      </div>
                    }
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlumniRequests;