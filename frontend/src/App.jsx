import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import HeroCarousel from "./components/HeroCarousel";
import LoginCard from "./components/LoginCard";
import AuthBackground from "./components/AuthBackground";
import PageBackground from "./components/PageBackground";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CustomerDashboard from "./components/CustomerDashboard";
import VendorDashboard from "./components/VendorDashboard";
import { getMe } from "./api";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(!!localStorage.getItem("token"));

  // Restore the session if a valid token is already stored
  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = (res) => {
    localStorage.setItem("token", res.access_token);
    setUser(res.user);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-royal" size={36} />
      </div>
    );
  }

  if (user) {
    return (
      <div className="relative flex min-h-screen flex-col bg-mist">
        <PageBackground />
        <Navbar user={user} onLogout={handleLogout} />
        <div className="relative z-10 flex-1">
          {user.role === "vendor" ? (
            <VendorDashboard user={user} />
          ) : (
            <CustomerDashboard user={user} />
          )}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.15fr_1fr]">
      <section className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <HeroCarousel />
        </div>
      </section>
      <section className="relative flex items-center justify-center overflow-hidden bg-mist p-6 sm:p-10">
        <AuthBackground />
        <div className="relative z-10 flex w-full justify-center">
          <LoginCard onLogin={handleLogin} />
        </div>
      </section>
    </div>
  );
}