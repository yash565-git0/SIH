import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { ArrowLeft, Smartphone, Shield, Leaf, Factory } from "lucide-react";
import { toast } from "sonner";

type UserType = "consumer" | "farmer" | "laboratory" | "manufacturer";

interface OTPVerificationProps {
  userType: UserType;
  onVerificationSuccess: (userType: UserType) => void;
  onBack: () => void;
}

export function OTPVerification({
  userType,
  onVerificationSuccess,
  onBack,
}: OTPVerificationProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const userTypeLabels = {
    farmer: "Farmer",
    laboratory: "Laboratory",
    consumer: "Consumer",
    manufacturer: "Manufacturer",
  };

  const userTypeDescriptions = {
    farmer: "Access your harvest tracking dashboard",
    laboratory: "Manage quality testing and certification",
    consumer: "Scan and verify product authenticity",
    manufacturer: "Manage herb processing and exports",
  };

  const userTypeIcons = {
    farmer: <Leaf className="h-8 w-8 text-emerald-600" />,
    laboratory: <Shield className="h-8 w-8 text-teal-600" />,
    consumer: <Smartphone className="h-8 w-8 text-amber-500" />,
    manufacturer: <Factory className="h-8 w-8 text-amber-600" />,
  };

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("OTP sent successfully to +91 " + phoneNumber);
    setStep("otp");
    setIsLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // For demo purposes, accept any 6-digit OTP
    if (otp.length === 6) {
      toast.success("Verification successful! Welcome to AyurTrace");
      onVerificationSuccess(userType);
    } else {
      toast.error("Invalid OTP. Please try again.");
    }

    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("OTP resent successfully");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50/30 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-emerald-200/50 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full">
                {userTypeIcons[userType]}
              </div>
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
              {userTypeLabels[userType]} Verification
            </CardTitle>
            <CardDescription className="text-emerald-600">
              {userTypeDescriptions[userType]}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === "phone" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-emerald-700">
                    Mobile Number
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 font-medium">
                      +91
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your 10-digit mobile number"
                      value={phoneNumber}
                      onChange={(e) =>
                        setPhoneNumber(
                          e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      className="pl-12 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                      maxLength={10}
                    />
                  </div>
                  <p className="text-sm text-emerald-600/80">
                    We'll send you a 6-digit verification code
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleSendOTP}
                    disabled={isLoading || phoneNumber.length !== 10}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                  >
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>

                  <Button
                    onClick={onBack}
                    variant="outline"
                    className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login Options
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-emerald-700 mb-2">
                      Verify OTP
                    </h3>
                    <p className="text-sm text-emerald-600">
                      Enter the 6-digit code sent to
                    </p>
                    <p className="text-sm font-medium text-teal-700">
                      +91 {phoneNumber}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOtp(value)}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={0}
                          className="border-emerald-200 focus:border-emerald-500"
                        />
                        <InputOTPSlot
                          index={1}
                          className="border-emerald-200 focus:border-emerald-500"
                        />
                        <InputOTPSlot
                          index={2}
                          className="border-emerald-200 focus:border-emerald-500"
                        />
                        <InputOTPSlot
                          index={3}
                          className="border-emerald-200 focus:border-emerald-500"
                        />
                        <InputOTPSlot
                          index={4}
                          className="border-emerald-200 focus:border-emerald-500"
                        />
                        <InputOTPSlot
                          index={5}
                          className="border-emerald-200 focus:border-emerald-500"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-emerald-600 mb-2">
                      Didn't receive the code?
                    </p>
                    <Button
                      onClick={handleResendOTP}
                      variant="link"
                      disabled={isLoading}
                      className="text-teal-600 hover:text-teal-700 p-0 h-auto"
                    >
                      Resend OTP
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={isLoading || otp.length !== 6}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                  >
                    {isLoading ? "Verifying..." : "Verify & Continue"}
                  </Button>

                  <Button
                    onClick={() => setStep("phone")}
                    variant="outline"
                    className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Change Mobile Number
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-emerald-600/80">
            Secured by AyurTrace Blockchain Network
          </p>
          <div className="flex items-center justify-center mt-2">
            <Shield className="h-4 w-4 text-emerald-500 mr-1" />
            <span className="text-xs text-emerald-500">
              End-to-end encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
