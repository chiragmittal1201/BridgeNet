import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AlumniProfile from "./pages/AlumniProfile";
import StudentView from "./pages/StudentView";
import AlumniRequests from "./pages/AlumniRequests";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists()) {
            setRole(snap.data().role);
          }
          setUser(u);
        } catch(e) {
          console.error(e);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh"}}>Loading...</div>;

  const getHome = () => {
    if (!user) return <Login />;
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "alumni") return <Navigate to="/alumni-profile" replace />;
    if (role === "student") return <Navigate to="/students" replace />;
    return <Login />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={getHome()} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
        <Route path="/admin" element={user && role === "admin" ? <AdminDashboard /> : <Navigate to="/" replace />} />
        <Route path="/alumni-profile" element={user && role === "alumni" ? <AlumniProfile /> : <Navigate to="/" replace />} />
        <Route path="/alumni-requests" element={user && role === "alumni" ? <AlumniRequests /> : <Navigate to="/" replace />} />
        <Route path="/students" element={user && role === "student" ? <StudentView /> : <Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;