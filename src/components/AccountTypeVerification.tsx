import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { PhoneVerification } from "./PhoneVerification";
import { 
  ArrowLeft, 
  CheckCircle, 
  Phone, 
  FileText, 
  Building,
  ChevronRight,
  Edit,
  Shield,
  X,
  Eye
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  userType: 'farmer' | 'trader' | 'buyer' | 'admin';
  accountType?: 'individual' | 'business';
  location?: string;
  phone?: string;
  phoneVerified?: boolean;
  verified?: boolean;
  businessName?: string;
  businessDescription?: string;
  businessLicenseNumber?: string;
  verificationStatus?: 'pending' | 'under_review' | 'verified' | 'rejected';
  verificationDocuments?: any;
  verificationSubmitted?: boolean;
  businessDetailsCompleted?: boolean;
  joinedDate?: string;
  rating?: number;
  totalReviews?: number;
}

interface AccountTypeVerificationProps {
  currentUser: User;
  onBack: () => void;
  onVerificationComplete?: () => void;
}

export function AccountTypeVerification({ currentUser, onBack, onVerificationComplete }: AccountTypeVerificationProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Determine starting step based on user's current verification status
  useEffect(() => {
    if (currentUser.phoneVerified && currentUser.verified) {
      setCurrentStep(4); // All complete
    } else if (currentUser.verified) {
      setCurrentStep(3); // Phone verification complete
    } else if (currentUser.phoneVerified) {
      setCurrentStep(2); // Phone verified, need document verification
    } else {
      setCurrentStep(1); // Start with phone verification
    }
  }, [currentUser]);

  const handlePhoneVerificationComplete = async (phoneNumber: string) => {
    try {
      setIsLoading(true);
      
      // Update user's phone verification status
      const response = await fetch('/api/auth/update-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ phoneNumber, phoneVerified: true }),
      });

      if (response.ok) {
        setCurrentStep(2);
        if (onVerificationComplete) {
          onVerificationComplete();
        }
      } else {
        setError('Failed to update phone verification status');
      }
    } catch (error) {
      console.error('Error updating phone verification:', error);
      setError('Failed to update phone verification status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentVerification = async () => {
    try {
      setIsLoading(true);
      
      // Submit verification request
      const response = await fetch('/api/auth/submit-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          verificationSubmitted: true,
          verificationStatus: 'under_review'
        }),
      });

      if (response.ok) {
        setCurrentStep(3);
        if (onVerificationComplete) {
          onVerificationComplete();
        }
      } else {
        setError('Failed to submit verification request');
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      setError('Failed to submit verification request');
    } finally {
      setIsLoading(false);
    }
  };

  const getVerificationStatus = () => {
    if (currentUser.verified) return 'verified';
    if (currentUser.verificationStatus === 'under_review') return 'under_review';
    if (currentUser.phoneVerified) return 'phone_verified';
    return 'unverified';
  };

  const verificationStatus = getVerificationStatus();

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: 'Phone Verification', completed: currentUser.phoneVerified },
      { number: 2, title: 'Document Upload', completed: currentUser.verificationSubmitted },
      { number: 3, title: 'Review Process', completed: currentUser.verified },
    ];

    return (
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              step.completed 
                ? 'bg-green-500 border-green-500 text-white' 
                : currentStep === step.number
                ? 'bg-primary border-primary text-white'
                : 'bg-muted border-muted-foreground text-muted-foreground'
            }`}>
              {step.completed ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{step.number}</span>
              )}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              step.completed || currentStep === step.number ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground mx-4" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPhoneVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Phone Verification</h2>
        <p className="text-muted-foreground">
          Verify your phone number to secure your account and enable important notifications.
        </p>
      </div>

      <PhoneVerification
        currentUser={currentUser}
        onVerificationComplete={handlePhoneVerificationComplete}
        onBack={onBack}
      />
    </div>
  );

  const renderDocumentVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Document Verification</h2>
        <p className="text-muted-foreground">
          Upload your identification documents to verify your account and build trust with other users.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Required Documents
          </CardTitle>
          <CardDescription>
            Upload the following documents to complete your verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">National ID Card</p>
                  <p className="text-sm text-muted-foreground">Government-issued identification</p>
                </div>
              </div>
              <Badge variant="outline">Required</Badge>
            </div>

            {currentUser.accountType === 'business' && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Business License</p>
                    <p className="text-sm text-muted-foreground">Official business registration document</p>
                  </div>
                </div>
                <Badge variant="outline">Required</Badge>
              </div>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Note:</strong> Document verification is currently in development. 
              Your account will be automatically verified for testing purposes.
            </p>
            <Button 
              onClick={handleDocumentVerification}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReviewProcess = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Verification Under Review</h2>
        <p className="text-muted-foreground">
          Your verification request has been submitted and is being reviewed by our team.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Review in Progress</h3>
              <p className="text-muted-foreground">
                Our team is reviewing your submitted documents. This process typically takes 1-3 business days.
              </p>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Under Review
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderVerificationComplete = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Verification Complete!</h2>
        <p className="text-muted-foreground">
          Congratulations! Your account has been successfully verified.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Badge className="bg-green-600 text-white">
              <CheckCircle className="w-4 h-4 mr-2" />
              Verified Account
            </Badge>
            <div>
              <h3 className="text-lg font-semibold mb-2">You're All Set!</h3>
              <p className="text-muted-foreground">
                Your verified status helps build trust with other users and unlocks additional features.
              </p>
            </div>
            <Button onClick={onBack} className="w-full">
              Continue to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={onBack} className="h-9 px-3 -ml-3">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-right">
          <h1 className="text-2xl font-bold">Account Verification</h1>
          <p className="text-muted-foreground">Secure your account and build trust</p>
        </div>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && renderPhoneVerification()}
        {currentStep === 2 && renderDocumentVerification()}
        {currentStep === 3 && renderReviewProcess()}
        {currentStep === 4 && renderVerificationComplete()}
      </div>
    </div>
  );
}