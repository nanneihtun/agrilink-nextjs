"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppHeader } from "@/components/AppHeader";
import { Phone, Send, CheckCircle, AlertCircle } from "lucide-react";

export default function TestSMSPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [senderId, setSenderId] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{success: boolean, message: string} | null>(null);

  const senderOptions = [
    { value: 'default', label: 'Default Twilio Number' },
    { value: 'team1', label: 'Team Member 1' },
    { value: 'team2', label: 'Team Member 2' },
    { value: 'team3', label: 'Team Member 3' },
  ];

  const handleSendSMS = async () => {
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

      const response = await fetch('/api/send-verification-sms-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          phoneNumber, 
          senderId 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({ 
          success: true, 
          message: `SMS sent successfully from ${data.senderId} (${data.senderNumber})` 
        });
      } else {
        setResult({ 
          success: false, 
          message: data.error || data.message || 'Failed to send SMS' 
        });
      }
    } catch (error: any) {
      setResult({ 
        success: false, 
        message: error.message || 'Failed to send SMS' 
      });
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
              Test SMS from Team Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number to Send To</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+959123456789"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +959 for Myanmar)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender">Send From Team Member</Label>
              <Select value={senderId} onValueChange={setSenderId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {senderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select which team member number to send from
              </p>
            </div>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleSendSMS}
              disabled={isLoading || !phoneNumber.trim()}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? 'Sending...' : 'Send Test SMS'}
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Add Team Numbers to Twilio</h4>
              <p className="text-sm text-muted-foreground">
                In your Twilio console, add each team member's phone number as a verified caller ID.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">2. Add Environment Variables</h4>
              <p className="text-sm text-muted-foreground">
                Add these to your .env.local file:
              </p>
              <pre className="bg-gray-100 p-2 rounded text-xs mt-1">
{`TEAM_PHONE_1=+959123456789
TEAM_PHONE_2=+959987654321
TEAM_PHONE_3=+959555555555`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Test SMS Sending</h4>
              <p className="text-sm text-muted-foreground">
                Use this interface to test sending OTPs from different team member numbers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
