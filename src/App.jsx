import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Pasar from "./pages/Pasar";
import Catatan from "./pages/Catatan";
import Profil from "./pages/Profil";
import Monitor from "./pages/Monitor";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./context/AuthContext";
import './styles/bottomNav.css';

function App() {
  const location = useLocation();
  const showBottomNav = !['/login', '/register'].includes(location.pathname);
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {showBottomNav && isLoggedIn && <Navbar />}
        <div className="flex-grow">
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              className={`${showBottomNav && isLoggedIn ? 'pt-20' : 'pt-0'} pb-24`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="container mx-auto px-4">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/pasar" element={<Pasar />} />
                  <Route path="/catatan" element={<Catatan />} />
                  <Route path="/profil" element={<Profil />} />
                  <Route path="/monitor" element={<Monitor />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Routes>
              </div>
            </motion.main>
          </AnimatePresence>
        </div>
        {showBottomNav && isLoggedIn && <BottomNav />}
      </div>
    </AuthProvider>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
