# Email Verification Setup Guide

## 🚀 **What's Implemented:**

✅ **Database Schema Updated**
- Added `email_verified`, `email_verification_token`, `email_verification_expires`, `pending_email` fields
- Your existing 12 demo accounts are automatically set as email verified

✅ **API Endpoints Created**
- `POST /api/auth/send-verification-email` - Send verification email
- `GET /api/auth/verify-email?token=xxx` - Verify email with token
- `POST /api/auth/update-email` - Update email address
- `GET /api/auth/verify-email-change?token=xxx` - Verify email change

✅ **Smart Demo Account Detection**
- Demo accounts (farmerindi*, farmerbiz*, traderindi*, traderbiz*, buyerindi*, buyerbiz*) skip email verification
- New real users require email verification

## 🔧 **Environment Variables Setup:**

### **1. Add to your `.env.local` file:**

```bash
# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key_here

# App URL (for verification links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **2. Get Resend API Key:**

1. **Go to [resend.com](https://resend.com)**
2. **Sign up for free account** (3,000 emails/month free)
3. **Create API Key** in dashboard
4. **Copy the API key** and add to `.env.local`

### **3. Test Without Resend (Optional):**

If you don't want to set up Resend right now, the system will work without it:
- Verification tokens are still generated
- API returns success (but no actual email sent)
- You can test the verification flow manually

## 🎯 **How It Works:**

### **For Demo Accounts:**
```typescript
// These accounts skip email verification
farmerindi1, farmerindi2
farmerbiz1, farmerbiz2
traderindi1, traderindi2
traderbiz1, traderbiz2
buyerindi1, buyerindi2
buyerbiz1, buyerbiz2
```

### **For Real Users:**
1. **User registers** → Account created with `email_verified: false`
2. **User requests verification** → Verification email sent (if Resend configured)
3. **User clicks email link** → Email verified, account activated
4. **User can now use full features**

### **Email Update Flow:**
1. **User clicks edit icon** on email field in profile
2. **User enters new email + current password** → Verification email sent to NEW email
3. **User clicks verification link** in new email → Email address updated
4. **Old email becomes invalid** for login, new email is now active

## 🧪 **Testing:**

### **Test with Demo Accounts:**
- Login with any demo account
- No email verification required
- Full access immediately

### **Test with Real Users:**
- Register with email like `your-email+test@gmail.com`
- Check server logs for verification token
- Test verification flow manually

### **Test Email Update:**
- Go to Profile page → Email Settings → Change Email
- Enter new email like `your-email+newtest@gmail.com`
- Enter current password
- Check new email for verification link
- Click link to complete email change

## 📧 **Email Template:**

The system sends a professional email with:
- AgriLink branding
- Clear verification button
- Fallback link for copy/paste
- 24-hour expiration notice

## 🚀 **Next Steps:**

1. **Set up Resend API key** (optional for testing)
2. **Add frontend components** for email verification UI
3. **Update registration flow** to show verification status
4. **Test with your email** using aliases like `your-email+test@gmail.com`

## 🔍 **Debug Logs:**

The system includes comprehensive logging:
- `📧 Send verification email API called`
- `🎭 Demo account detected, skipping email verification`
- `✅ Verification email sent successfully`
- `✅ Email verified successfully`

Check your server terminal for detailed logs!
