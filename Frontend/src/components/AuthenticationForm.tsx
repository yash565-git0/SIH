// src/components/AuthenticationForm.tsx
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertCircle, CheckCircle, Phone, Shield, User, Wheat, FlaskConical, Building2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../contexts/AuthContext';

// +++ Firebase Client SDK imports +++
import { auth } from './firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

const API_BASE_URL = 'http://localhost:3001/auth';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}


// --- UI Sub-components (Unchanged) ---
// Your excellent UI components are preserved exactly as you wrote them.

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, error, disabled }) => {
  const [countryCode, setCountryCode] = useState("+91"); // default India

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10); // allow only 10 digits
    onChange(`${countryCode}${cleaned}`);
  };

  const displayValue = value.startsWith(countryCode) ? value.substring(countryCode.length) : "";

  useEffect(() => {
    // This effect ensures the full phone number state is updated when country code changes
    const currentNumericValue = value.replace(/\D/g, '').slice(-10);
    onChange(`${countryCode}${currentNumericValue}`);
  }, [countryCode]);

  return (
    <div className="space-y-2">
      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
        Phone Number
      </Label>
      <div className="flex">
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          disabled={disabled}
          className="p-2 border border-gray-300 rounded-l-md bg-white text-sm focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="+91">🇮🇳 +91</option>
          <option value="+1">🇺🇸 +1</option>
          <option value="+44">🇬🇧 +44</option>
          <option value="+61">🇦🇺 +61</option>
          <option value="+81">🇯🇵 +81</option>
        </select>
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            id="phone"
            type="tel"
            placeholder="9876543210"
            value={displayValue}
            onChange={handleChange}
            disabled={disabled}
            className={`pl-10 rounded-l-none ${error ? 'border-red-500' : ''}`}
            maxLength={10}
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-4 w-4" />{error}</p>}
    </div>
  );
};

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({ value, onChange, error, disabled }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '').slice(0, 6);
    onChange(input);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
        Verification Code
      </Label>
      <div className="relative">
        <Shield className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input
          id="otp"
          type="text"
          placeholder="123456"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`pl-10 text-center tracking-widest ${error ? 'border-red-500' : ''}`}
          maxLength={6}
        />
      </div>
      {error && <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-4 w-4" />{error}</p>}
    </div>
  );
};

interface UserTypeSelectorProps {
  selectedType: string;
  onSelect: (type: string) => void;
  disabled?: boolean;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({ selectedType, onSelect, disabled }) => {
  const userTypes = [
    { id: 'Consumer', label: 'Consumer', icon: User, description: 'Verify product authenticity', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
    { id: 'FarmerUnion', label: 'Farmer Union', icon: Wheat, description: 'Record harvest data', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
    { id: 'Manufacturer', label: 'Manufacturer', icon: Building2, description: 'Process products', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { id: 'Laboratory', label: 'Laboratory', icon: FlaskConical, description: 'Submit test results', color: 'text-teal-600', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' }
  ];

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700">Select User Type</Label>
      <div className="grid grid-cols-2 gap-3">
        {userTypes.map((userType) => {
          const Icon = userType.icon;
          const isSelected = selectedType === userType.id;
          return (
            <div
              key={userType.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${isSelected ? `${userType.borderColor} ${userType.bgColor}` : 'border-gray-200 bg-white hover:border-gray-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && onSelect(userType.id)}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <Icon className={`w-8 h-8 ${isSelected ? userType.color : 'text-gray-400'}`} />
                <div className={`font-medium text-sm ${isSelected ? userType.color : 'text-gray-600'}`}>{userType.label}</div>
                <div className="text-xs text-gray-500">{userType.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// --- Main AuthenticationForm Component (Logic is Rewritten) ---

interface AuthenticationFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthenticationForm: React.FC<AuthenticationFormProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [otp, setOtp] = useState('');
  const [userType, setUserType] = useState('');
  const [userDetails, setUserDetails] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  const { login } = useAuth();

  useEffect(() => {
    // Reset the form state whenever the modal is opened
    if (isOpen) {
      setMode(initialMode);
      setStep(1);
      setPhoneNumber('+91');
      setOtp('');
      setUserType('');
      setUserDetails({});
      setError('');
      setSuccess('');
      setCountdown(0);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  };

  const sendOTP = async () => {
    setError('');
    setSuccess('');
    if (phoneNumber.length < 12) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (mode === 'register' && !userType) {
      setError('Please select a user type for registration.');
      return;
    }
    setLoading(true);

    try {
      // Create the verifier right here, just before you use it.
      // This is the most reliable pattern in React.
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
      
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      
      // We still attach it to window for the next step
      window.confirmationResult = confirmationResult;
      
      setSuccess('Verification code sent to your phone.');
      setCountdown(60);
      setStep(2);
    } catch (err) {
      console.error("Firebase OTP Error:", err);
      setError('Failed to send OTP. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
};

  const resendOTP = async () => {
    if (countdown > 0) return;
    // Just call the same sendOTP function again
    sendOTP();
  };

  const handleVerifyAndSubmit = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (mode === 'register' && step === 2 && ['Consumer', 'Manufacturer', 'FarmerUnion', 'Laboratory'].includes(userType)) {
      setStep(3); // Go to details form if needed
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Confirm OTP with Firebase
      const confirmationResult = window.confirmationResult;
      if (!confirmationResult) throw new Error("Verification process expired. Please request a new code.");
      const credential = await confirmationResult.confirm(otp);

      // 2. Get the Firebase ID Token
      const idToken = await credential.user.getIdToken();

      // 3. Send ID Token and data to YOUR backend
      const payload: any = { idToken, ...userDetails };

if (mode === 'register') {
  payload.userType = userType;
}

const handleContactPersonChange = (field: 'firstName' | 'lastName', value: string) => {
    setUserDetails(prev => ({
        ...prev,
        contactPerson: {
            ...prev.contactPerson,
            [field]: value,
        }
    }));
};

const response = await fetch(`${API_BASE_URL}/verify-and-signin`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});


      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'An error occurred on the server.');

      if (mode === 'login') {
        setSuccess('Login successful!');
        login(data.user, data.token, data.refreshToken);
        setTimeout(() => onClose(), 1500);
      } else { // Registration
        setSuccess('Registration successful! Please login.');
        setTimeout(() => {
          setMode('login');
          setStep(1);
          setOtp('');
          setSuccess('');
        }, 2000);
      }
    } catch (err: any) {
      console.error("Verification/Submit Error:", err);
      setError(err.message || 'Invalid code or server error.');
    } finally {
      setLoading(false);
    }
  };

  const renderUserDetailsForm = () => {
    const handleDetailChange = (field: string, value: any) => {
      setUserDetails(prev => ({ ...prev, [field]: value }));
    };

    // This is the new helper function from Step 1
    const handleContactPersonChange = (field: 'firstName' | 'lastName', value: string) => {
        setUserDetails(prev => ({
            ...prev,
            contactPerson: {
                ...prev.contactPerson,
                [field]: value,
            }
        }));
    };

    switch (userType) {
      case 'Consumer':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="firstName">First Name</Label><Input id="firstName" value={userDetails.firstName || ''} onChange={(e) => handleDetailChange('firstName', e.target.value)} placeholder="John" required /></div>
              <div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" value={userDetails.lastName || ''} onChange={(e) => handleDetailChange('lastName', e.target.value)} placeholder="Doe" required /></div>
            </div>
            <div><Label htmlFor="email">Email (Optional)</Label><Input id="email" type="email" value={userDetails.email || ''} onChange={(e) => handleDetailChange('email', e.target.value)} placeholder="john.doe@example.com" /></div>
          </div>
        );
      case 'Manufacturer':
        return (
          <div className="space-y-4">
            <div><Label htmlFor="companyName">Company Name</Label><Input id="companyName" value={userDetails.companyName || ''} onChange={(e) => handleDetailChange('companyName', e.target.value)} placeholder="Your Company Inc." required /></div>
            <div><Label htmlFor="businessRegistrationNumber">Business Registration Number</Label><Input id="businessRegistrationNumber" value={userDetails.businessRegistrationNumber || ''} onChange={(e) => handleDetailChange('businessRegistrationNumber', e.target.value)} placeholder="REG123456" required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="contactFirstName">Contact First Name</Label><Input id="contactFirstName" value={userDetails.contactPerson?.firstName || ''} onChange={(e) => handleContactPersonChange('firstName', e.target.value)} placeholder="John" required /></div>
              <div><Label htmlFor="contactLastName">Contact Last Name</Label><Input id="contactLastName" value={userDetails.contactPerson?.lastName || ''} onChange={(e) => handleContactPersonChange('lastName', e.target.value)} placeholder="Doe" required /></div>
            </div>
            <div>
              <Label htmlFor="businessType">Business Type</Label>
              <select id="businessType" className="w-full p-2 border border-gray-300 rounded-md" value={userDetails.businessType || ''} onChange={(e) => handleDetailChange('businessType', e.target.value)} required>
                <option value="">Select Business Type</option><option value="processor">Processor</option><option value="packager">Packager</option><option value="distributor">Distributor</option><option value="exporter">Exporter</option>
              </select>
            </div>
          </div>
        );
      case 'FarmerUnion':
        return (
          <div className="space-y-4">
            <div><Label htmlFor="unionName">Union Name</Label><Input id="unionName" value={userDetails.unionName || ''} onChange={(e) => handleDetailChange('unionName', e.target.value)} placeholder="Central Farmers Union" required/></div>
            <div><Label htmlFor="registrationNumber">Registration Number</Label><Input id="registrationNumber" value={userDetails.registrationNumber || ''} onChange={(e) => handleDetailChange('registrationNumber', e.target.value)} placeholder="UNIONREG123" required/></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="contactFirstName">Contact First Name</Label><Input id="contactFirstName" value={userDetails.contactPerson?.firstName || ''} onChange={(e) => handleContactPersonChange('firstName', e.target.value)} placeholder="Jane" required/></div>
              <div><Label htmlFor="contactLastName">Contact Last Name</Label><Input id="contactLastName" value={userDetails.contactPerson?.lastName || ''} onChange={(e) => handleContactPersonChange('lastName', e.target.value)} placeholder="Smith" required/></div>
            </div>
          </div>
        );
      case 'Laboratory':
        return (
          <div className="space-y-4">
            <div><Label htmlFor="labName">Laboratory Name</Label><Input id="labName" value={userDetails.labName || ''} onChange={(e) => handleDetailChange('labName', e.target.value)} placeholder="Quality Labs Inc." required/></div>
            <div><Label htmlFor="licenseNumber">License Number</Label><Input id="licenseNumber" value={userDetails.licenseNumber || ''} onChange={(e) => handleDetailChange('licenseNumber', e.target.value)} placeholder="LABLIC456" required/></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="contactFirstName">Contact First Name</Label><Input id="contactFirstName" value={userDetails.contactPerson?.firstName || ''} onChange={(e) => handleContactPersonChange('firstName', e.target.value)} placeholder="Dr. Alex" required/></div>
              <div><Label htmlFor="contactLastName">Contact Last Name</Label><Input id="contactLastName" value={userDetails.contactPerson?.lastName || ''} onChange={(e) => handleContactPersonChange('lastName', e.target.value)} placeholder="Chen" required/></div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div id="recaptcha-container" className="fixed bottom-0 right-0"></div>
      <Card className="w-full max-w-md mx-4 p-6 relative">
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-2 right-2 rounded-full h-8 w-8 text-gray-400 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
        </Button>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-sm text-gray-600 mt-1">{step === 1 && 'Enter your phone number to continue'}{step === 2 && 'Enter the verification code sent to your phone'}{step === 3 && 'Complete your profile information'}</p>
          </div>

          {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
          {success && <Alert className="border-green-200 bg-green-50 text-green-700"><CheckCircle className="h-4 w-4 text-green-600" /><AlertDescription>{success}</AlertDescription></Alert>}

          {step === 1 && (
            <div className="space-y-4">
              <PhoneInput value={phoneNumber} onChange={setPhoneNumber} disabled={loading} />
              {mode === 'register' && <UserTypeSelector selectedType={userType} onSelect={setUserType} disabled={loading} />}
              <Button onClick={sendOTP} disabled={loading || !phoneNumber.trim() || (mode === 'register' && !userType)} className="w-full bg-emerald-600 hover:bg-emerald-700">{loading ? 'Sending...' : 'Send Verification Code'}</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center text-sm text-gray-600">Code sent to {phoneNumber}</div>
              <OTPInput value={otp} onChange={setOtp} disabled={loading} />
              <Button onClick={handleVerifyAndSubmit} disabled={loading || otp.length !== 6} className="w-full bg-emerald-600 hover:bg-emerald-700">{loading ? 'Verifying...' : mode === 'login' ? 'Login' : 'Continue'}</Button>
              <div className="text-center">
                <Button variant="ghost" onClick={resendOTP} disabled={countdown > 0 || loading} className="text-sm">{countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}</Button>
              </div>
            </div>
          )}

          {step === 3 && mode === 'register' && (
            <div className="space-y-4">
              {renderUserDetailsForm()}
              <Button onClick={handleVerifyAndSubmit} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">{loading ? 'Creating Account...' : 'Create Account'}</Button>
            </div>
          )}

          {step > 1 && <Button variant="ghost" onClick={() => setStep(step - 1)} className="w-full">Back</Button>}

          <div className="text-center pt-2 border-t">
            <p className="text-sm text-gray-600">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <Button variant="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-emerald-600 hover:text-emerald-700 p-0 h-auto font-medium">{mode === 'login' ? 'Sign up' : 'Sign in'}</Button>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};