# Production Twilio Setup Guide

## 🎯 Overview

This guide helps you migrate from fallback/development SMS verification to production Twilio integration. The migration removes all fallback features and prepares your database for real SMS verification.

## 🚀 Quick Migration

### 1. Run the Production Migration
```bash
# This will remove all fallback features and prepare for production
npm run db:production
```

### 2. Set Up Twilio Credentials
Add these to your `.env.local`:
```bash
# Required Twilio Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Remove these development variables (if they exist)
# TWILIO_DEVELOPMENT_MODE=true
# TWILIO_FALLBACK_CODE=123456
# TWILIO_OVERRIDE_PHONE=+1234567890
```

### 3. Update Frontend API Calls
Replace your current SMS API calls with production endpoints:

**Before (Development):**
```javascript
// Old endpoints
fetch('/api/verification/send-sms', { ... })
fetch('/api/verification/verify-sms', { ... })
```

**After (Production):**
```javascript
// New production endpoints
fetch('/api/verification/send-sms-production', { ... })
fetch('/api/verification/verify-sms-production', { ... })
```

## 📱 What Changes

### Database Changes
- ✅ **Removed fallback columns** (actual_phone, override_phone, verification_method)
- ✅ **Removed OTP sharing table** (development only)
- ✅ **Cleaned up verification_codes** (only essential columns remain)
- ✅ **Added proper constraints** (unique userId, phone format validation)
- ✅ **Added performance indexes** (phone, expiresAt, twilioSid)

### API Changes
- ✅ **Real Twilio integration** (no more fallback codes)
- ✅ **Proper error handling** (Twilio-specific error codes)
- ✅ **Rate limiting** (1 minute between requests)
- ✅ **Phone validation** (E.164 format required)
- ✅ **Automatic cleanup** (expired codes removed)

### Frontend Changes
- ✅ **Update API endpoints** to production versions
- ✅ **Remove fallback UI** (no more "123456" codes)
- ✅ **Real SMS testing** (actual phone numbers required)

## 🔧 Twilio Setup

### 1. Create Twilio Account
1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account
3. Verify your phone number

### 2. Get Credentials
1. **Account SID**: Found in Account Info
2. **Auth Token**: Found in Account Info (click to reveal)
3. **Verify Service SID**: Create a Verify Service

### 3. Create Verify Service
1. Go to Verify → Services
2. Click "Create new Service"
3. Name it "AgriLink SMS Verification"
4. Copy the Service SID

### 4. Configure Webhook (Optional)
For automatic OTP extraction:
1. Go to your Verify Service settings
2. Set webhook URL: `https://yourdomain.com/api/twilio/webhook`
3. Enable status callbacks

## 📋 Testing Checklist

### Before Migration
- [ ] Backup your database
- [ ] Test current functionality
- [ ] Note any custom fallback logic

### After Migration
- [ ] Verify database structure
- [ ] Test with real phone numbers
- [ ] Check error handling
- [ ] Verify rate limiting works
- [ ] Test cleanup functions

### Production Testing
- [ ] Test with various phone numbers
- [ ] Test error scenarios (invalid numbers, expired codes)
- [ ] Test rate limiting
- [ ] Monitor Twilio usage and costs

## 🚨 Important Notes

### Phone Number Format
- **Required**: E.164 format (`+1234567890`)
- **Invalid**: `1234567890`, `+1-234-567-8900`, `(123) 456-7890`
- **Valid**: `+1234567890`, `+44123456789`, `+8612345678901`

### Rate Limiting
- **1 minute** between verification requests per user
- **10 minutes** code expiration
- **Automatic cleanup** of expired codes

### Error Handling
- **Invalid phone**: Clear error message
- **Rate limited**: "Please wait a minute" message
- **Expired code**: "Verification expired" message
- **Invalid code**: "Invalid verification code" message

## 🔍 Troubleshooting

### Common Issues

**"Missing required Twilio environment variables"**
- Check your `.env.local` file
- Ensure all three variables are set
- Restart your development server

**"Invalid phone number format"**
- Use E.164 format: `+1234567890`
- Include country code
- No spaces or special characters

**"Verification not found"**
- Check if verification expired (10 minutes)
- Ensure user is requesting verification first
- Check database for verification records

**"Twilio connection failed"**
- Verify credentials are correct
- Check Twilio account status
- Ensure Verify Service exists

### Debug Mode
Set `NODE_ENV=development` to see detailed error messages in API responses.

## 📊 Monitoring

### Twilio Console
- Monitor verification attempts
- Track success/failure rates
- Monitor costs and usage

### Database Monitoring
```sql
-- Check active verifications
SELECT COUNT(*) FROM verification_codes WHERE "expiresAt" > NOW();

-- Check recent verifications
SELECT * FROM verification_codes 
WHERE "createdAt" > NOW() - INTERVAL '1 hour' 
ORDER BY "createdAt" DESC;

-- Clean up expired codes
SELECT cleanup_expired_verification_codes();
```

## 🎉 You're Ready!

Your database is now production-ready for Twilio SMS verification. Users will receive real SMS messages, and you have proper error handling, rate limiting, and monitoring in place.

**Happy verifying! 🚀**
