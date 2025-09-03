import { useState } from 'react';
import { Hero } from './components/Hero';
import { TraceabilityFlow } from './components/TraceabilityFlow';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ConsumerExperience } from './components/ConsumerExperience';
import { Navigation } from './components/Navigation';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');

  const renderSection = () => {
    switch (activeSection) {
      case 'hero':
        return (
          <>
          <Hero/>
          <TraceabilityFlow/>
          </>
        )
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return (
          <>
          <Hero/>
          <TraceabilityFlow/>
          </>
        )
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50/30 to-teal-50">
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="pt-16">
        {renderSection()}
      </main>
    </div>
  );
}