# Email Verification Setup Guide

## 🌾 **AgriLink Email Verification System**

AgriLink uses Resend for reliable email delivery with professional templates and comprehensive verification flows.

**Live URL**: https://agrilink-nextjs.vercel.app  
**Email Service**: Resend (3,000 emails/month free tier)

---

## ✅ **Current Implementation Status**

### **🔐 Complete Email Verification System**
- ✅ **Registration Verification** - New users must verify email before full access
- ✅ **Email Change Verification** - Secure email address updates
- ✅ **Password Reset** - Email-based password recovery
- ✅ **Professional Templates** - Branded emails with AgriLink styling
- ✅ **Demo Account Bypass** - Test accounts skip verification for development
- ✅ **Token Security** - 24-hour expiration, secure token generation
- ✅ **Error Handling** - Comprehensive error messages and fallbacks

### **📧 Email Templates**
- ✅ **Welcome Email** - Account verification with branded design
- ✅ **Email Change** - New email verification with security notice
- ✅ **Password Reset** - Secure password recovery with clear instructions
- ✅ **Mobile Responsive** - Templates work on all devices

---

## 🔧 **Environment Variables Setup**

### **Required Environment Variables**
```env
# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key_here

# App URL (for verification links)
NEXT_PUBLIC_APP_URL=https://agrilink-nextjs.vercel.app

# Database (Neon)
DATABASE_URL=your_neon_connection_string

# Authentication
JWT_SECRET=your_jwt_secret
```

### **Getting Resend API Key**
1. **Visit [resend.com](https://resend.com)**
2. **Sign up for free account** (3,000 emails/month free)
3. **Create API Key** in dashboard
4. **Copy the API key** and add to environment variables

---

## 🎯 **Email Verification Flows**

### **1. New User Registration**
```
User Registration → Email Verification Required → Verification Email Sent → 
User Clicks Link → Email Verified → Account Activated → Full Access Granted
```

### **2. Email Address Change**
```
Profile → Change Email → Enter New Email + Password → Verification Email to New Address → 
User Clicks Link → Email Updated → Old Email Invalidated
```

### **3. Password Reset**
```
Forgot Password → Enter Email → Reset Email Sent → 
User Clicks Link → New Password Form → Password Updated
```

---

## 🧪 **Testing the System**

### **Demo Accounts (Skip Verification)**
These accounts bypass email verification for testing:
```typescript
// Individual Accounts
farmerindi1@gmail.com, farmerindi2@gmail.com
traderindi1@gmail.com, traderindi2@gmail.com
buyerindi1@gmail.com, buyerindi2@gmail.com

// Business Accounts  
farmerbiz1@gmail.com, farmerbiz2@gmail.com
traderbiz1@gmail.com, traderbiz2@gmail.com
buyerbiz1@gmail.com, buyerbiz2@gmail.com

// Admin Account
admin@agrilink.com
```

### **Real User Testing**
1. **Register with email** like `your-email+test@gmail.com`
2. **Check email** for verification message
3. **Click verification link** to activate account
4. **Test full functionality** after verification

### **Email Change Testing**
1. **Login to any account**
2. **Go to Profile → Email Settings**
3. **Enter new email** like `your-email+newtest@gmail.com`
4. **Enter current password**
5. **Check new email** for verification
6. **Click link** to complete change

---

## 📧 **Email Template Features**

### **Professional Design**
- ✅ **AgriLink Branding** - Consistent with website design
- ✅ **Clear Call-to-Action** - Prominent verification buttons
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **Fallback Links** - Copy/paste option for accessibility

### **Security Features**
- ✅ **24-Hour Expiration** - Tokens expire for security
- ✅ **Single Use** - Tokens invalidated after use
- ✅ **Secure Generation** - Cryptographically secure tokens
- ✅ **Rate Limiting** - Prevents spam and abuse

### **User Experience**
- ✅ **Clear Instructions** - Step-by-step guidance
- ✅ **Error Handling** - Helpful error messages
- ✅ **Multiple Languages** - English and Myanmar support
- ✅ **Accessibility** - Screen reader friendly

---

## 🔍 **API Endpoints**

### **Email Verification**
```typescript
POST /api/auth/send-verification-email
GET  /api/auth/verify-email?token=xxx
POST /api/auth/update-email
GET  /api/auth/verify-email-change?token=xxx
```

### **Password Reset**
```typescript
POST /api/auth/request-password-reset
POST /api/auth/reset-password
```

---

## 🚀 **Production Deployment**

### **Vercel Environment Variables**
Add these to your Vercel dashboard:
- `RESEND_API_KEY` - Your Resend API key
- `NEXT_PUBLIC_APP_URL` - Your production URL
- `DATABASE_URL` - Neon database connection
- `JWT_SECRET` - Secure JWT secret

### **Domain Verification**
1. **Add your domain** to Resend dashboard
2. **Verify domain ownership** via DNS records
3. **Update sender address** to use your domain
4. **Test email delivery** from production

---

## 📊 **Monitoring & Analytics**

### **Email Delivery Metrics**
- **Delivery Rate** - Track successful email delivery
- **Open Rate** - Monitor email engagement
- **Click Rate** - Track verification link clicks
- **Bounce Rate** - Monitor invalid email addresses

### **System Logs**
The system provides comprehensive logging:
```
📧 Send verification email API called
🎭 Demo account detected, skipping email verification
✅ Verification email sent successfully
✅ Email verified successfully
❌ Invalid verification token
⏰ Verification token expired
```

---

## 🔧 **Troubleshooting**

### **Common Issues**
1. **Emails not sending** - Check Resend API key and domain verification
2. **Verification links not working** - Verify NEXT_PUBLIC_APP_URL setting
3. **Tokens expiring quickly** - Check system time synchronization
4. **Demo accounts requiring verification** - Check email pattern matching

### **Debug Steps**
1. **Check server logs** for detailed error messages
2. **Verify environment variables** are set correctly
3. **Test with demo accounts** first to isolate issues
4. **Check Resend dashboard** for delivery status

---

## 🎯 **Next Steps for Team**

### **Immediate Tasks**
1. **Set up Resend account** with production domain
2. **Configure environment variables** in Vercel
3. **Test email flows** with real email addresses
4. **Monitor delivery rates** and user engagement

### **Future Enhancements**
1. **Email Templates** - Customize branding and messaging
2. **Analytics Integration** - Track email performance
3. **A/B Testing** - Optimize email content and design
4. **Multi-language Support** - Expand language options

---

*This email verification system provides a robust, secure, and user-friendly experience for AgriLink users. Regular monitoring and optimization ensure reliable email delivery and user engagement.*
