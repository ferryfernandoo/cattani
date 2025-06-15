import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import '../styles/brand.css';
import {
  HomeIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  UserIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  const navItems = [
    { path: "/", label: "Home", icon: HomeIcon, color: "hover:text-emerald-600" },
    { path: "/pasar", label: "Pasar", icon: ShoppingBagIcon, color: "hover:text-emerald-600" },
    { path: "/catatan", label: "Catatan", icon: DocumentTextIcon, color: "hover:text-emerald-600" },
    { path: "/monitor", label: "Monitor", icon: ChartBarIcon, color: "hover:text-emerald-600" },
    { path: "/profil", label: "Profil", icon: UserIcon, color: "hover:text-emerald-600" },
  ];

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
              <motion.span
                className="brand-icon text-2xl"
                whileHover={{ rotate: 20, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                🌴
              </motion.span>
              <span className="text-2xl font-black tracking-tight text-emerald-600">CATTANI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                  ${location.pathname === item.path
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-gray-600 hover:bg-emerald-50 " + item.color
                  }`}
              >
                <item.icon className="h-5 w-5 mr-1.5" />
                {item.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Hi, {userName}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1.5" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1.5" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium
                    ${location.pathname === item.path
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-gray-600 hover:bg-emerald-50 " + item.color
                    }`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.label}
                </Link>
              ))}
              {isLoggedIn ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-600">
                    Hi, {userName}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;