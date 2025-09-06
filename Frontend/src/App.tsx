// src/App.tsx
import { useState } from 'react';
import { Hero } from './components/Hero';
import { TraceabilityFlow } from './components/TraceabilityFlow';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ConsumerExperience } from './components/ConsumerExperience';
import { FarmerDashboard } from './components/FarmerDashboard';
import { LaboratoryDashboard } from './components/LaboratoryDashboard';
import { Navigation } from './components/Navigation';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const [activeSection, setActiveSection] = useState('hero');
  const { user, isAuthenticated } = useAuth();

  const renderSection = () => {
    // Non-logged-in users: only Hero + Analytics
    if (!isAuthenticated) {
      switch (activeSection) {
        case 'analytics':
          return <AnalyticsDashboard />;
        case 'hero':
        default:
          return (
            <>
              <Hero />
              <TraceabilityFlow />
            </>
          );
      }
    }

    // Logged-in users
    switch (activeSection) {
      case 'hero':
        return (
          <>
            <Hero />
            <TraceabilityFlow />
          </>
        );

      case 'analytics':
        return <AnalyticsDashboard />;

      case 'consumer-portal':
        return user?.userType === 'Consumer' ? <ConsumerExperience /> : <Hero />;

      case 'farmer-portal':
        return user?.userType === 'FarmerUnion' ? <FarmerDashboard onLogout={() => console.log("Logout")} /> : <Hero />;

      case 'manufacturer-portal':
        return user?.userType === 'Manufacturer' ? (
          <div className="container mx-auto py-20 text-center">
            <h2 className="text-3xl font-bold text-blue-700">Manufacturer Dashboard</h2>
            <p className="text-gray-600">This dashboard is coming soon.</p>
          </div>
        ) : (
          <Hero />
        );

      case 'lab-portal':
        return user?.userType === 'Laboratory' ? <LaboratoryDashboard onLogout={() => console.log("Logout")} /> : <Hero />;

      case 'profile':
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Profile Settings</h2>
              <p className="text-gray-600">Profile management features will be available here.</p>
            </div>
          </div>
        );

      default:
        return (
          <>
            <Hero />
            <TraceabilityFlow />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50/30 to-teal-50">
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="pt-16">{renderSection()}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}