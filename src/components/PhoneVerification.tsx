import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Phone, CheckCircle, Clock, AlertCircle, Shield, Edit } from 'lucide-react';

interface PhoneVerificationProps {
  currentUser: any;
  onVerificationComplete: (phoneNumber: string) => void;
  onBack?: () => void;
}

export function PhoneVerification({ currentUser, onVerificationComplete, onBack }: PhoneVerificationProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phone || '');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  // Update phone number when currentUser changes
  useEffect(() => {
    if (currentUser.phone) {
      setPhoneNumber(currentUser.phone);
    }
  }, [currentUser.phone]);

  // Start countdown timer
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verification/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('otp');
        startCountdown();
      } else {
        setError(data.message || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verification/verify-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, otpCode }),
      });

      const data = await response.json();

      if (response.ok) {
        onVerificationComplete(phoneNumber);
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (countdown > 0) return;
    setOtpCode('');
    setError('');
    handleSendOTP();
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Phone Verification</CardTitle>
          <p className="text-muted-foreground">
            {step === 'phone' 
              ? 'Enter your phone number to receive a verification code'
              : 'Enter the 6-digit code sent to your phone'
            }
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'phone' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+95 9 123 456 789"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll send you a 6-digit verification code via SMS
                </p>
              </div>

              <Button 
                onClick={handleSendOTP} 
                className="w-full" 
                disabled={isLoading || !phoneNumber}
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Code sent to {phoneNumber}
                </p>
              </div>

              <Button 
                onClick={handleVerifyOTP} 
                className="w-full" 
                disabled={isLoading || otpCode.length !== 6}
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={handleResendOTP}
                  disabled={countdown > 0}
                  className="text-sm"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep('phone');
                    setOtpCode('');
                    setError('');
                  }}
                  className="text-sm"
                >
                  Change Phone Number
                </Button>
              </div>
            </div>
          )}

          {onBack && (
            <div className="text-center">
              <Button variant="outline" onClick={onBack} className="w-full">
                Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}