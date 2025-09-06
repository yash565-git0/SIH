// src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { Navigation } from '../components/Navigation';
import { Dashboard } from './Dashboard'; // if you have an analytics dashboard
import { FarmerDashboard } from './FarmerDashboard';
import { ConsumerPortal } from './ConsumerPortal';
import { ConsumerExperience } from './ConsumerExperience';
import { ConsumerScanner } from './ConsumerScanner';
import { LaboratoryDashboard } from './LaboratoryDashboard';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { QrCode, Search, Package, Home } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('hero');
  const [consumerTab, setConsumerTab] = useState<'scanner' | 'experience' | 'portal'>('scanner');

  // Auto-set active section based on user type
  useEffect(() => {
    if (!user) return setActiveSection('hero');

    switch (user.userType) {
      case 'Consumer':
        setActiveSection('consumer-portal');
        break;
      case 'Manufacturer':
        setActiveSection('manufacturer-portal');
        break;
      case 'FarmerUnion':
        setActiveSection('farmer-portal');
        break;
      case 'Laboratory':
        setActiveSection('lab-portal');
        break;
      default:
        setActiveSection('hero');
    }
  }, [user]);

  // Consumer portal with tabs
  const renderConsumerDashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-emerald-100 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
            Consumer Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Verify authenticity and trace your Ayurvedic products</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant={consumerTab === 'scanner' ? 'default' : 'ghost'}
            onClick={() => setConsumerTab('scanner')}
            className={`px-6 py-3 rounded-xl transition-all duration-300 ${
              consumerTab === 'scanner'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <QrCode className="w-4 h-4 mr-2" />
            QR Scanner
          </Button>
          <Button
            variant={consumerTab === 'experience' ? 'default' : 'ghost'}
            onClick={() => setConsumerTab('experience')}
            className={`px-6 py-3 rounded-xl transition-all duration-300 ${
              consumerTab === 'experience'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <Search className="w-4 h-4 mr-2" />
            Product Verification
          </Button>
          <Button
            variant={consumerTab === 'portal' ? 'default' : 'ghost'}
            onClick={() => setConsumerTab('portal')}
            className={`px-6 py-3 rounded-xl transition-all duration-300 ${
              consumerTab === 'portal'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <Package className="w-4 h-4 mr-2" />
            Product Database
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-screen">
        {consumerTab === 'scanner' && <ConsumerScanner onLogout={() => console.log("Logout")} />}
        {consumerTab === 'experience' && <ConsumerExperience />}
        {consumerTab === 'portal' && <ConsumerPortal />}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />

      <main className="pt-16">
        {/* Analytics dashboard (optional) */}
        {activeSection === 'analytics' && (
          <div className="max-w-7xl mx-auto p-4">
            <Dashboard />
          </div>
        )}

        {/* Farmer dashboard */}
        {activeSection === 'farmer-portal' && (
          <div className="max-w-7xl mx-auto p-4">
            <FarmerDashboard onLogout={() => console.log("Logout")} />
          </div>
        )}

        {/* Manufacturer placeholder */}
        {activeSection === 'manufacturer-portal' && (
          <div className="max-w-7xl mx-auto p-4 text-center py-20">
            <h2 className="text-3xl font-bold text-blue-700">Manufacturer Dashboard</h2>
            <p className="text-gray-600">This dashboard is coming soon.</p>
          </div>
        )}

        {/* Laboratory dashboard */}
        {activeSection === 'lab-portal' && (
          <div className="max-w-7xl mx-auto p-4">
            <LaboratoryDashboard onLogout={() => console.log("Logout")} />
          </div>
        )}

        {/* Consumer portal with tabs */}
        {activeSection === 'consumer-portal' && renderConsumerDashboard()}

        {/* Hero / welcome */}
        {activeSection === 'hero' && (
          <div className="max-w-7xl mx-auto p-4 text-center py-20">
            <Home className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-emerald-700 mb-4">Welcome to AyurChain</h2>
            <p className="text-gray-600">Your trusted platform for Ayurvedic product traceability</p>
          </div>
        )}
      </main>
    </div>
  );
}