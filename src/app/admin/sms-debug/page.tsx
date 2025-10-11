"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppHeader } from "@/components/AppHeader";
import { Phone, Send, CheckCircle, AlertCircle, Info } from "lucide-react";

export default function SMSDebugPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [method, setMethod] = useState('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{success: boolean, message: string, provider?: string, fallbackUsed?: boolean} | null>(null);

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setResult({ success: false, message: 'Please enter a phone number' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/send-otp-multi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          phoneNumber, 
          userEmail: userEmail || undefined,
          preferredMethod: method
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({ 
          success: true, 
          message: data.message,
          provider: data.provider,
          fallbackUsed: data.fallbackUsed
        });
      } else {
        setResult({ 
          success: false, 
          message: data.error || data.message || 'Failed to send OTP' 
        });
      }
    } catch (error: any) {
      setResult({ 
        success: false, 
        message: error.message || 'Failed to send OTP' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkCurrentConfig = () => {
    // This will show what's currently configured
    const envVars = {
      TWILIO_ACCOUNT_SID: process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID ? 'Set' : 'Not set',
      TWILIO_AUTH_TOKEN: process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN ? 'Set' : 'Not set',
      TWILIO_PHONE_NUMBER: process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER || 'Not set',
    };
    
    alert(`Current Configuration:\n${Object.entries(envVars).map(([key, value]) => `${key}: ${value}`).join('\n')}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader currentUser={null} onLogout={() => {}} />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              SMS Debug & Multi-Provider OTP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This tool helps you test OTP sending with multiple providers and fallback methods when Twilio has restrictions.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+959123456789"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">User Email (Optional - for email fallback)</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">OTP Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (Try Twilio, then fallback)</SelectItem>
                  <SelectItem value="email">Email Only</SelectItem>
                  <SelectItem value="local">Local SMS (Demo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {result.message}
                  {result.provider && (
                    <div className="mt-1 text-sm">
                      Provider: {result.provider}
                      {result.fallbackUsed && <span className="text-yellow-600"> (Fallback used)</span>}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleSendOTP}
                disabled={isLoading || !phoneNumber.trim()}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={checkCurrentConfig}
              >
                Check Config
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Twilio Restrictions & Solutions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">🚫 Why You Can't Add Numbers</h4>
              <p className="text-sm text-muted-foreground">
                Twilio restricts SMS verification in certain countries (like Germany 🇩🇪). 
                This is why you see the "restricted country" error.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">🔍 Find Your Current Number</h4>
              <p className="text-sm text-muted-foreground">
                Click "Check Config" to see your current Twilio phone number. 
                This number was likely added when you first set up Twilio.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">✅ Solutions</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use Myanmar numbers (+95) - usually unrestricted</li>
                <li>• Use US/UK numbers (+1, +44) - often available</li>
                <li>• Use email fallback for OTP delivery</li>
                <li>• Use local SMS providers in Myanmar</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
