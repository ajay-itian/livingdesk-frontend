"use client";

import { Facebook, Instagram, Linkedin, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Footer = () => {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Admin credentials
  const ADMIN_USERNAME = "livingdesk@admin.com";
  const ADMIN_PASSWORD = "livingdesk2026";

  const handleLogoClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount === 2) {
      setShowAdminModal(true);
      setClickCount(0);
    }
    setTimeout(() => setClickCount(0), 2000);
  };

  const handleAdminAccess = () => {
    setShowAdminModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowAdminModal(false);
    setCredentials({ username: "", password: "" });
    setError("");
    setShowPassword(false);
  };

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    if (!credentials.username || !credentials.password) {
      setError("Please enter both username and password");
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      if (
        credentials.username === ADMIN_USERNAME &&
        credentials.password === ADMIN_PASSWORD
      ) {
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminEmail', ADMIN_USERNAME);
        localStorage.setItem('adminLoginTime', new Date().toISOString());

        closeModal();

        // IMPORTANT: Because you have trailingSlash: true in next.config.js,
        // you MUST include the trailing slash here to avoid AWS 404/Redirects.
        router.push('/visitor-survey/');

      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (
    <>
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3
                onClick={handleLogoClick}
                className="text-2xl font-bold mb-4 cursor-pointer select-none transition-all hover:opacity-80"
              >
                The Living Desk
              </h3>
              <p className="text-primary-foreground/80">
                Your premium air-conditioned coworking space for productivity and growth
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-primary-foreground">Home</button></li>
                <li><button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-primary-foreground">Services</button></li>
                <li><button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary-foreground/80 hover:text-primary-foreground">Pricing</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>+91 70660 02651</li>
                <li>+91 95959 10945</li>
                <li>contact@thelivingdesk.in</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/people/The-Living-Desk-Coworking-Spaces/61580666948052/" target="_blank" className="text-primary-foreground/80 hover:text-primary-foreground"><Facebook className="h-5 w-5" /></a>
                <a href="https://www.instagram.com/thelivingdesk/" target="_blank" className="text-primary-foreground/80 hover:text-primary-foreground"><Instagram className="h-5 w-5" /></a>
                <a href="https://www.linkedin.com/company/living-desk/" target="_blank" className="text-primary-foreground/80 hover:text-primary-foreground"><Linkedin className="h-5 w-5" /></a>
              </div>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/80">
            <p>
              &copy; {new Date().getFullYear()} The Living Desk. All rights reserved.
              <span className="mx-2">|</span>
              <button onClick={handleAdminAccess} className="text-primary-foreground/50 hover:text-primary-foreground/90 transition-colors text-xs underline-offset-2 hover:underline inline-flex items-center gap-1">
                <Lock className="h-3 w-3" /> Admin
              </button>
            </p>
          </div>
        </div>
      </footer>

      {showAdminModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full"><Lock className="h-8 w-8 text-primary" /></div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Admin Login</h2>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2 text-sm"><AlertCircle className="h-5 w-5" />{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input type="text" value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} onKeyDown={handleKeyPress} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none text-gray-800" placeholder="admin@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} onKeyDown={handleKeyPress} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none pr-12 text-gray-800" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                </div>
              </div>
              <button onClick={handleLogin} disabled={isLoading} className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {isLoading ? "Logging in..." : "Login to Admin Portal"}
              </button>
              <button onClick={closeModal} className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;