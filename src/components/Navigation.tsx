import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ChevronDown, User, Wheat, FlaskConical } from 'lucide-react';

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function Navigation({ activeSection, setActiveSection }: NavigationProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'analytics', label: 'Analytics Dashboard' }
  ];

  const userTypes = [
    { 
      id: 'consumer', 
      label: 'Consumer', 
      icon: User,
      description: 'Verify product authenticity',
      color: 'text-emerald-600'
    },
    { 
      id: 'farmer', 
      label: 'Farmer', 
      icon: Wheat,
      description: 'Record harvest data',
      color: 'text-amber-600'
    },
    { 
      id: 'laboratory', 
      label: 'Laboratory', 
      icon: FlaskConical,
      description: 'Submit test results',
      color: 'text-teal-600'
    }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-emerald-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">AyurChain</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              {sections.map((section) => (
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
              ))}
            </div>
            
            {/* Login Dropdown */}
            <DropdownMenu open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 hover:from-emerald-700 hover:via-teal-700 hover:to-amber-600 text-white px-6 py-2 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Login
                  <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${isLoginOpen ? 'rotate-180' : ''}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-72 mt-2 bg-white/95 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-2xl p-2"
              >
                <div className="p-3 border-b border-emerald-100">
                  <h3 className="text-lg font-bold text-emerald-900">Select User Type</h3>
                  <p className="text-sm text-slate-600">Choose your role to access the platform</p>
                </div>
                {userTypes.map((userType) => {
                  const Icon = userType.icon;
                  return (
                    <DropdownMenuItem 
                      key={userType.id}
                      className="p-4 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200 cursor-pointer group"
                      onClick={() => {
                        console.log(`Login as ${userType.label}`);
                        setIsLoginOpen(false);
                      }}
                    >
                      <div className="flex items-center space-x-4 w-full">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                          <Icon className={`w-6 h-6 ${userType.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-emerald-900 group-hover:text-emerald-700 transition-colors">
                            {userType.label}
                          </div>
                          <div className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors">
                            {userType.description}
                          </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity rotate-[-90deg]" />
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-xl">
                  Login
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-64 bg-white/95 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-2xl p-2"
              >
                <div className="p-2 border-b border-emerald-100">
                  <h3 className="font-bold text-emerald-900">Select User Type</h3>
                </div>
                {userTypes.map((userType) => {
                  const Icon = userType.icon;
                  return (
                    <DropdownMenuItem 
                      key={userType.id}
                      className="p-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200 cursor-pointer"
                      onClick={() => console.log(`Login as ${userType.label}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${userType.color}`} />
                        <div>
                          <div className="font-semibold text-emerald-900 text-sm">{userType.label}</div>
                          <div className="text-xs text-slate-600">{userType.description}</div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" size="sm" className="text-emerald-700 border-emerald-300 rounded-xl">
              Menu
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}