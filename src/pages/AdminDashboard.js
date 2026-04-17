import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("alumni");

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setUsers(list);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateVerification = async (id, status) => {
    await updateDoc(doc(db, "users", id), { verified: status });
    fetchUsers();
  };

  const alumni = users.filter(u => u.role === "alumni");
  const students = users.filter(u => u.role === "student");
  const pendingCount = alumni.filter(a => !a.verified).length;

  const statCards = [
    { label:"Total Alumni", value:alumni.length, icon:"🎓", color:"#e8eaf6" },
    { label:"Verified Alumni", value:alumni.filter(a=>a.verified).length, icon:"✅", color:"#e8f5e9" },
    { label:"Pending Approval", value:pendingCount, icon:"⏳", color:"#fff3e0" },
    { label:"Total Students", value:students.length, icon:"📚", color:"#e3f2fd" },
  ];

  return (
    <div style={{minHeight:"100vh",backgroundColor:"#f5f7ff"}}>
      {/* Navbar */}
      <div style={{background:"linear-gradient(135deg, #1a237e, #1565c0)",color:"white",padding:"0 32px",display:"flex",justifyContent:"space-between",alignItems:"center",height:"64px",boxShadow:"0 2px 12px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <span style={{fontSize:"24px"}}>🎓</span>
          <div>
            <div style={{fontWeight:"700",fontSize:"18px"}}>BridgeNet</div>
            <div style={{fontSize:"11px",opacity:0.8}}>Admin Dashboard</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
          {pendingCount > 0 && <span style={{background:"#ff5722",color:"white",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"600"}}>⚠ {pendingCount} Pending</span>}
          <button onClick={() => signOut(auth)} style={{background:"rgba(255,255,255,0.15)",color:"white",border:"1px solid rgba(255,255,255,0.3)",padding:"8px 18px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"14px"}}>Logout</button>
        </div>
      </div>

      <div style={{padding:"32px",maxWidth:"1100px",margin:"0 auto"}}>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px",marginBottom:"32px"}}>
          {statCards.map((s,i) => (
            <div key={i} style={{background:"white",padding:"24px",borderRadius:"12px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",borderLeft:`4px solid #1a237e`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:"32px",fontWeight:"700",color:"#1a237e"}}>{s.value}</div>
                  <div style={{fontSize:"13px",color:"#666",marginTop:"4px"}}>{s.label}</div>
                </div>
                <div style={{fontSize:"32px"}}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{background:"white",borderRadius:"12px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",overflow:"hidden"}}>
          <div style={{display:"flex",borderBottom:"1px solid #eee"}}>
            {["alumni","students"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{padding:"16px 28px",border:"none",background:activeTab===tab?"#f5f7ff":"white",color:activeTab===tab?"#1a237e":"#666",fontWeight:activeTab===tab?"700":"400",fontSize:"14px",cursor:"pointer",borderBottom:activeTab===tab?"3px solid #1a237e":"3px solid transparent",textTransform:"capitalize"}}>
                {tab === "alumni" ? `Alumni (${alumni.length})` : `Students (${students.length})`}
              </button>
            ))}
          </div>

          <div style={{padding:"24px"}}>
            {loading ? <p style={{textAlign:"center",color:"#666"}}>Loading...</p> :
              activeTab === "alumni" ? (
                alumni.length === 0 ? <p style={{textAlign:"center",color:"#666",padding:"40px"}}>No alumni registered yet.</p> :
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{backgroundColor:"#f5f7ff"}}>
                      {["Name","Email","Status","Action"].map(h => (
                        <th key={h} style={{padding:"12px 16px",textAlign:"left",color:"#1a237e",fontSize:"13px",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.5px"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alumni.map(a => (
                      <tr key={a.id} style={{borderBottom:"1px solid #f0f0f0"}}>
                        <td style={{padding:"14px 16px",fontWeight:"600",color:"#333"}}>{a.name || "—"}</td>
                        <td style={{padding:"14px 16px",color:"#666",fontSize:"14px"}}>{a.email}</td>
                        <td style={{padding:"14px 16px"}}>
                          <span style={{padding:"5px 14px",borderRadius:"20px",fontSize:"12px",fontWeight:"700",backgroundColor:a.verified?"#e8f5e9":"#fff3e0",color:a.verified?"#2e7d32":"#e65100"}}>
                            {a.verified ? "✓ Verified" : "⏳ Pending"}
                          </span>
                        </td>
                        <td style={{padding:"14px 16px"}}>
                          {a.verified ?
                            <button onClick={() => updateVerification(a.id, false)} style={{padding:"7px 16px",backgroundColor:"#ffebee",color:"#c62828",border:"none",borderRadius:"6px",cursor:"pointer",fontWeight:"600",fontSize:"13px"}}>Revoke</button> :
                            <button onClick={() => updateVerification(a.id, true)} style={{padding:"7px 16px",backgroundColor:"#e8f5e9",color:"#2e7d32",border:"none",borderRadius:"6px",cursor:"pointer",fontWeight:"600",fontSize:"13px"}}>✓ Approve</button>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                students.length === 0 ? <p style={{textAlign:"center",color:"#666",padding:"40px"}}>No students registered yet.</p> :
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{backgroundColor:"#f5f7ff"}}>
                      {["Name","Email","Status"].map(h => (
                        <th key={h} style={{padding:"12px 16px",textAlign:"left",color:"#1a237e",fontSize:"13px",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.5px"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id} style={{borderBottom:"1px solid #f0f0f0"}}>
                        <td style={{padding:"14px 16px",fontWeight:"600",color:"#333"}}>{s.name || "—"}</td>
                        <td style={{padding:"14px 16px",color:"#666",fontSize:"14px"}}>{s.email}</td>
                        <td style={{padding:"14px 16px"}}>
                          <span style={{padding:"5px 14px",borderRadius:"20px",fontSize:"12px",fontWeight:"700",backgroundColor:"#e8f5e9",color:"#2e7d32"}}>✓ Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;