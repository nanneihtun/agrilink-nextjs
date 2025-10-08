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
  
  // Update phone number when currentUser changes
  useEffect(() => {
    if (currentUser.phone) {
      setPhoneNumber(currentUser.phone);
    }
  }, [currentUser.phone]);
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isTwilioConfigured, setIsTwilioConfigured] = useState(false);
  const [verificationSid, setVerificationSid] = useState<string | null>(null);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  // Check Twilio configuration on component mount
  useEffect(() => {
    // Twilio configuration is handled server-side only
    setIsTwilioConfigured(true);
  }, []);

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
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid phone number with country code (e.g., +959123456789)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('📱 Sending verification SMS via API...');
      
      // Send OTP via Next.js API
      const token = localStorage.getItem('token');
      const response = await fetch('/api/send-verification-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ phoneNumber }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please try again.');
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || 'Failed to send verification code');
      }

      setVerificationSid(result.verificationSid || null);
      setStep('otp');
      startCountdown();
      
      console.log('✅ Verification SMS sent successfully');
    } catch (err: any) {
      console.error('❌ Send OTP error:', err);
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Verifying OTP code...');
      
      // Verify OTP via Next.js API
      const token = localStorage.getItem('token');
      const response = await fetch('/api/verify-sms-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          phoneNumber,
          code: otpCode,
          verificationSid 
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please try again.');
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || 'Invalid verification code');
      }

      console.log('✅ Phone verification successful');
      
      // Update user profile with verified phone
      const updateResponse = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: phoneNumber,
          phoneVerified: true,
          phoneVerificationDate: new Date().toISOString()
        }),
      });

      if (!updateResponse.ok) {
        console.warn('Failed to update user profile, but verification was successful');
      } else {
        // Update localStorage with the new phone verification status
        try {
          const currentUserData = localStorage.getItem('user');
          if (currentUserData) {
            const user = JSON.parse(currentUserData);
            user.phoneVerified = true;
            user.phone = phoneNumber;
            localStorage.setItem('user', JSON.stringify(user));
            console.log('✅ Updated user data in localStorage');
          }
        } catch (error) {
          console.warn('Failed to update localStorage:', error);
        }
      }

      // Call completion callback
      onVerificationComplete(phoneNumber);
      
    } catch (err: any) {
      console.error('❌ Verify OTP error:', err);
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setError('');
    await handleSendOTP();
  };

  const handleEditPhone = () => {
    setIsEditingPhone(true);
    setStep('phone');
    setOtpCode('');
    setError('');
  };

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display (e.g., +959 123 456 789)
    if (phone.startsWith('+')) {
      const countryCode = phone.substring(0, 3);
      const number = phone.substring(3);
      const formatted = number.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
      return `${countryCode} ${formatted}`;
    }
    return phone;
  };

  if (step === 'phone') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Phone Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              We'll send a verification code to your phone number to confirm your identity.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex gap-2">
              <Input
                id="phone"
                type="tel"
                placeholder="+959123456789"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +959 for Myanmar)
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            {onBack && (
              <Button variant="outline" onClick={onBack} className="flex-1">
                Back
              </Button>
            )}
            <Button 
              onClick={handleSendOTP} 
              disabled={isLoading || !phoneNumber.trim()}
              className="flex-1"
            >
              {isLoading ? 'Sending...' : 'Send Code'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          Enter Verification Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            We've sent a 6-digit verification code to{' '}
            <span className="font-medium">{formatPhoneNumber(phoneNumber)}</span>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            type="text"
            placeholder="123456"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="text-center text-lg tracking-widest"
            disabled={isLoading}
            maxLength={6}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditPhone}
              disabled={isLoading}
              className="h-auto p-0 text-xs"
            >
              <Edit className="w-3 h-3 mr-1" />
              Change Number
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {countdown > 0 ? (
              <>
                <Clock className="w-3 h-3" />
                <span className="text-muted-foreground">
                  Resend in {countdown}s
                </span>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="h-auto p-0 text-xs"
              >
                Resend Code
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleVerifyOTP} 
          disabled={isLoading || otpCode.length !== 6}
          className="w-full"
        >
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </Button>
      </CardContent>
    </Card>
  );
}