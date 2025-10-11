"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppHeader } from "@/components/AppHeader";
import { Phone, CheckCircle, AlertCircle } from "lucide-react";

export default function TwilioTestPage() {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testTwilio = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Test with a Myanmar number
      const response = await fetch('/api/send-verification-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          phoneNumber: '+959123456789' // Test Myanmar number
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(`✅ SUCCESS: ${data.message}\n📱 Your Twilio number is working!\n\nTo add team numbers:\n1. Go to Twilio Console → Phone Numbers\n2. Look for your active number (it should be there)\n3. Add new numbers from unrestricted countries:\n   - 🇺🇸 US (+1)\n   - 🇬🇧 UK (+44)\n   - 🇸🇬 Singapore (+65)`);
      } else {
        setResult(`❌ ERROR: ${data.error || data.message}\n\nThis means:\n1. Your Twilio isn't configured properly\n2. Or the current number has restrictions\n\nCheck your .env.local file for:\n- TWILIO_ACCOUNT_SID\n- TWILIO_AUTH_TOKEN\n- TWILIO_PHONE_NUMBER`);
      }
    } catch (error: any) {
      setResult(`❌ FAILED: ${error.message}\n\nThis means your Twilio setup has issues.\nCheck your environment variables.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader currentUser={null} onLogout={() => {}} />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Twilio Configuration Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will test your current Twilio setup and tell you exactly what to do next.
            </p>

            <Button 
              onClick={testTwilio}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test Current Twilio Setup'}
            </Button>

            {result && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Fix Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Check Your Current Number</h4>
              <p className="text-sm text-muted-foreground">
                Run the test above to see if your current Twilio number works.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">2. Add Team Numbers from Unrestricted Countries</h4>
              <p className="text-sm text-muted-foreground">
                In Twilio Console, try adding numbers from:
              </p>
              <ul className="text-sm text-muted-foreground mt-1 ml-4">
                <li>• 🇺🇸 United States (+1)</li>
                <li>• 🇬🇧 United Kingdom (+44)</li>
                <li>• 🇸🇬 Singapore (+65)</li>
                <li>• 🇲🇾 Malaysia (+60)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Avoid Restricted Countries</h4>
              <p className="text-sm text-muted-foreground">
                Don't try to add numbers from: Germany, France, Italy, and other restricted countries.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
