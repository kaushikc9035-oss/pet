import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ReportPet from "./pages/ReportPet";
import Browse from "./pages/Browse";
import MapView from "./pages/MapView";
import ChatPage from "./pages/ChatPage";
import { User } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  const handleLogin = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  if (loading) return null;

  return (
    <Router>
      <div className="min-h-screen bg-white font-sans selection:bg-orange-100 selection:text-orange-600">
        <Navbar user={user} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth onLogin={handleLogin} />} />
            <Route path="/report/:type" element={<ReportPet token={token} />} />
            <Route path="/browse" element={<Browse token={token} />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/chat" element={<ChatPage user={user} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-100 py-12 mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-black text-xs">PF</div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">PetFinder</span>
            </div>
            <p className="text-sm text-gray-400 font-medium mb-8 max-w-md mx-auto">
              Connecting lost pets with their families since 2026. A community-driven initiative for animal welfare.
            </p>
            <div className="flex justify-center gap-8 mb-8">
              {["About", "Privacy", "Terms", "Contact"].map((item) => (
                <a key={item} href="#" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-orange-500 transition-colors">
                  {item}
                </a>
              ))}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">
              {/* Copyright removed per user request */}
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
