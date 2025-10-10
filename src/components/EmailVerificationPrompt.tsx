'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';

interface EmailVerificationPromptProps {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
  };
  onEmailVerified?: () => void;
}

export default function EmailVerificationPrompt({ user, onEmailVerified }: EmailVerificationPromptProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage('');
    setResendStatus('idle');

    try {
      const response = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResendStatus('success');
        setResendMessage('Verification email sent! Please check your inbox.');
      } else {
        setResendStatus('error');
        setResendMessage(data.message || 'Failed to send verification email.');
      }
    } catch (error) {
      setResendStatus('error');
      setResendMessage('Failed to send verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (response.ok && data.user?.emailVerified) {
        onEmailVerified?.();
      }
    } catch (error) {
      console.error('Failed to check verification status:', error);
    }
  };

  if (user.emailVerified) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Email Verified
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 text-sm">
            Your email address has been verified. You have full access to all AgriLink features.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Mail className="h-5 w-5" />
          Email Verification Required
        </CardTitle>
        <CardDescription className="text-yellow-700">
          Please verify your email address to access all features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-yellow-800">
            We've sent a verification email to <strong>{user.email}</strong>. 
            Please check your inbox and click the verification link.
          </p>
          <p className="text-xs text-yellow-600">
            Didn't receive the email? Check your spam folder or request a new one.
          </p>
        </div>

        {resendMessage && (
          <Alert variant={resendStatus === 'success' ? 'default' : 'destructive'}>
            <AlertDescription>{resendMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleResendVerification}
            disabled={isResending}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            {isResending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend Email'
            )}
          </Button>
          <Button 
            onClick={handleCheckVerification}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Check Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
