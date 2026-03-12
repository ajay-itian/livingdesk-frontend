import { Facebook, Instagram, Linkedin, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Admin credentials
  const ADMIN_USERNAME = "livingdesk@admin.com";
  const ADMIN_PASSWORD = "livingdesk2026";

  // Method 1: Logo Click Pattern (Triple Click)
  const handleLogoClick = () => {
    setClickCount(prev => prev + 1);

    if (clickCount === 2) {
      setShowAdminModal(true);
      setClickCount(0);
    }

    setTimeout(() => setClickCount(0), 2000);
  };

  // Method 2: Open Admin Login Modal
  const handleAdminAccess = () => {
    setShowAdminModal(true);
    setError("");
  };

  // Close Modal
  const closeModal = () => {
    setShowAdminModal(false);
    setCredentials({ username: "", password: "" });
    setError("");
    setShowPassword(false);
  };

  // Handle Login
  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    // Validation
    if (!credentials.username || !credentials.password) {
      setError("Please enter both username and password");
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check credentials
      if (
        credentials.username === ADMIN_USERNAME &&
        credentials.password === ADMIN_PASSWORD
      ) {
        // Store admin session
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminEmail', ADMIN_USERNAME);
        localStorage.setItem('adminLoginTime', new Date().toISOString());

        // Close modal
        closeModal();

        // Navigate to visitor survey form
        // For React Router: use navigate('/visitor-survey')
        // For plain redirect:
        navigate('/visitor-survey');


      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (
    <>
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

            {/* Company Info with Secret Admin Access */}
            <div>
              <h3
                onClick={handleLogoClick}
                className="text-2xl font-bold mb-4 cursor-pointer select-none transition-all hover:opacity-80"
                title="Triple-click for admin access"
              >
                The Living Desk
              </h3>
              <p className="text-primary-foreground/80">
                Your premium coworking space for productivity and growth
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Services
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Pricing
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>+91 70660 02650</li>
                <li>thelivingdesk@gmail.com</li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/people/The-Living-Desk-Coworking-Spaces/61580666948052/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/thelivingdesk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/company/living-desk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright with Discreet Admin Link */}
          <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/80">
            <p>
              &copy; {new Date().getFullYear()} The Living Desk. All rights reserved.
              <span className="mx-2">|</span>
              <button
                onClick={handleAdminAccess}
                className="text-primary-foreground/50 hover:text-primary-foreground/90 transition-colors text-xs underline-offset-2 hover:underline inline-flex items-center gap-1"
              >
                <Lock className="h-3 w-3" />
                Admin
              </button>
            </p>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal */}
      {showAdminModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
              Admin Login
            </h2>
            <p className="text-gray-600 text-center mb-6 text-sm">
              Enter your credentials to access the admin portal
            </p>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Login Fields */}
            <div className="space-y-4">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username / Email
                </label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-800"
                  placeholder="enter the admin email"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pr-12 text-gray-800"
                    placeholder="Enter password"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Logging in...
                    </>
                  ) : (
                    'Login to Admin Portal'
                  )}
                </button>

                <button
                  onClick={closeModal}
                  disabled={isLoading}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-all font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                🔒 Secure admin access for The Living Desk
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;