import { useState } from "react";
import { Hero } from "./components/Hero";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { Navigation } from "./components/Navigation";
import { ConsumerScanner } from "./components/ConsumerScanner";
import { FarmerDashboard } from "./components/FarmerDashboard";
import { LaboratoryDashboard } from "./components/LaboratoryDashboard";
import { ManufacturerDashboard } from "./components/ManufacturerDashboard";
import { OTPVerification } from "./components/OTPVerification";
import { Toaster } from "./components/ui/sonner";
import { TraceabilityFlow } from "./components/TraceabilityFlow";

type UserType = "consumer" | "farmer" | "laboratory" | "manufacturer" | null;

export default function App() {
  const [activeSection, setActiveSection] = useState("hero");
  const [currentUser, setCurrentUser] = useState<UserType>(null);
  const [pendingUserType, setPendingUserType] = useState<UserType>(null);

  const handleLogin = (userType: UserType) => {
    // For consumer, go directly to scanner (no OTP needed)
    if (userType === "consumer") {
      setCurrentUser(userType);
    } else {
      // For farmer/laboratory/manufacturer, show OTP verification first
      setPendingUserType(userType);
    }
  };

  const handleOTPVerificationSuccess = (userType: UserType) => {
    setCurrentUser(userType);
    setPendingUserType(null);
  };

  const handleOTPVerificationBack = () => {
    setPendingUserType(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPendingUserType(null);
    setActiveSection("hero");
  };

  const renderSection = () => {
    // If OTP verification is pending, show OTP form
    if (pendingUserType) {
      return (
        <OTPVerification
          userType={pendingUserType}
          onVerificationSuccess={handleOTPVerificationSuccess}
          onBack={handleOTPVerificationBack}
        />
      );
    }

    // If user is logged in, show their specific dashboard
    if (currentUser) {
      switch (currentUser) {
        case "consumer":
          return <ConsumerScanner onLogout={handleLogout} />;
        case "farmer":
          return <FarmerDashboard onLogout={handleLogout} />;
        case "laboratory":
          return <LaboratoryDashboard onLogout={handleLogout} />;
        case "manufacturer":
          return <ManufacturerDashboard onLogout={handleLogout} />;
        default:
          return (
            <>
              <Hero />;
              <TraceabilityFlow />;
            </>
          );
      }
    }

    // Otherwise show regular sections
    switch (activeSection) {
      case "hero":
        return  (
            <>
              <Hero />;
              <TraceabilityFlow />;
            </>
          );
      case "analytics":
        return <AnalyticsDashboard />;
      default:
        return  (
            <>
              <Hero />;
              <TraceabilityFlow />;
            </>
          );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50/30 to-teal-50">
      {/* Hide navigation during OTP verification */}
      {/* {!pendingUserType && (
        <Navigation
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onLogin={handleLogin}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )} */}
      <main className={pendingUserType ? "" : "pt-16"}>{renderSection()}</main>
      <Toaster />
    </div>
  );
}
