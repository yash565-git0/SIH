import { useState } from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { ChevronDown, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthenticationForm } from './AuthenticationForm';

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function Navigation({ activeSection, setActiveSection }: NavigationProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user, logout, isAuthenticated } = useAuth();

  // Updated sections configuration - consolidated consumer sections
  const sections = [
    // For general public
    { id: 'hero', label: 'Home', allowed: ['public'] },
    { id: 'analytics', label: 'Analytics Dashboard', allowed: ['public'] },

    // Consumer-specific (consolidated into one portal)
    { id: 'consumer-portal', label: 'Consumer Portal', allowed: ['Consumer'] },

    // Other user types
    { id: 'farmer-portal', label: 'Farmer Dashboard', allowed: ['FarmerUnion'] },
    { id: 'manufacturer-portal', label: 'Manufacturer Dashboard', allowed: ['Manufacturer'] },
    { id: 'lab-portal', label: 'Laboratory Dashboard', allowed: ['Laboratory'] },
  ];

  const handleLogin = () => {
    setAuthMode('login');
    setIsLoginOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    setActiveSection('hero'); // redirect to hero on logout
  };

  const isSectionAllowed = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return false;
    if (!isAuthenticated) return section.allowed.includes('public');
    return section.allowed.includes(user?.userType || '');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-emerald-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                AyurChain
              </h1>
            </div>

            {/* Desktop sections */}
            <div className="hidden md:flex items-center space-x-6">
              {sections.map(
                section =>
                  isSectionAllowed(section.id) && (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveSection(section.id)}
                      className={`px-6 py-2 rounded-xl transition-all duration-300 ${
                        activeSection === section.id
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50'
                      }`}
                    >
                      {section.label}
                    </Button>
                  )
              )}

              {isAuthenticated ? (
                // User dropdown
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-xl flex items-center space-x-2"
                    >
                      <User className="w-4 h-4" />
                      <span>{user?.firstName || user?.companyName || 'User'}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 mt-2 bg-white/95 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-2xl p-2">
                    <DropdownMenuItem onClick={() => setActiveSection('profile')}>Profile Settings</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={handleLogout}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={handleLogin} className="bg-emerald-600 text-white px-4 py-2 rounded-xl">Get Started</Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Login/Register Modal */}
      <AuthenticationForm
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}