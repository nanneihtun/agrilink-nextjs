# Twilio Integration Setup

This guide shows how to prepare your database for Twilio verification while keeping fallback support for development.

## 🚀 Quick Start

### 1. Run Database Migration

```bash
# Run the migration script
npm run db:twilio

# Or run the SQL directly
psql $DATABASE_URL -f prepare-twilio-database.sql
```

### 2. Set Environment Variables

Add to your `.env.local`:

```bash
# Development (Fallback mode)
TWILIO_DEVELOPMENT_MODE=true
TWILIO_FALLBACK_CODE=123456

# Twilio Production (only needed for production)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid
```

### 3. Update Your Frontend

Replace your current SMS API calls with the enhanced versions:

```typescript
// Send verification code
const response = await fetch('/api/verification/send-sms-enhanced', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ phone: '+1234567890' })
});

// Verify code
const verifyResponse = await fetch('/api/verification/verify-sms-enhanced', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ 
    phone: '+1234567890', 
    code: '123456' 
  })
});
```

## 🔧 Development Mode (Fallback)

In development mode (`TWILIO_DEVELOPMENT_MODE=true`):

- ✅ Uses fallback code generation
- ✅ Accepts both generated code AND `123456`
- ✅ Logs codes to console
- ✅ No SMS costs
- ✅ No Twilio credentials needed

**Example response:**
```json
{
  "message": "Verification code sent successfully",
  "method": "fallback",
  "code": "789123",
  "fallbackCode": "123456"
}
```

## 📱 Production Mode (Twilio)

In production mode (`TWILIO_DEVELOPMENT_MODE=false`):

- ✅ Sends real SMS via Twilio
- ✅ Only accepts Twilio-generated codes
- ✅ Tracks verification attempts
- ✅ Full security and compliance
- ✅ Requires Twilio credentials

**Example response:**
```json
{
  "message": "Verification code sent successfully",
  "method": "twilio"
}
```

## 📊 Database Schema

### verification_codes table
```sql
CREATE TABLE verification_codes (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expiresAt TIMESTAMP WITH TIME ZONE NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Twilio fields
  twilio_sid TEXT,
  verification_method TEXT DEFAULT 'fallback', -- 'fallback' or 'twilio'
  twilio_status TEXT, -- 'pending', 'approved', 'denied', 'expired'
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE
);
```

### user_verification table additions
```sql
ALTER TABLE user_verification 
ADD COLUMN phone_verification_method TEXT DEFAULT 'fallback',
ADD COLUMN phone_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN phone_verification_attempts INTEGER DEFAULT 0;
```

## 🔄 Migration Strategy

### Phase 1: Development Setup
1. Run migration script
2. Set `TWILIO_DEVELOPMENT_MODE=true`
3. Test with fallback codes
4. Update frontend to use enhanced APIs

### Phase 2: Production Preparation
1. Get Twilio credentials
2. Set up Twilio Verify service
3. Test with real SMS in staging
4. Set `TWILIO_DEVELOPMENT_MODE=false` for production

### Phase 3: Monitoring
1. Monitor verification success rates
2. Track costs and usage
3. Set up alerts for failures
4. Optimize based on data

## 🛠️ Advanced Configuration

### Custom Fallback Code
```bash
TWILIO_FALLBACK_CODE=999999
```

### Rate Limiting
The service includes built-in rate limiting:
- 1 verification per minute per user
- Automatic cleanup of expired codes
- Attempt tracking and monitoring

### Monitoring
```typescript
// Get verification statistics
const stats = await twilioService.getVerificationStats();
console.log(stats);
```

## 🚨 Troubleshooting

### Common Issues

1. **Migration fails**: Check database permissions
2. **Twilio not working**: Verify credentials and service SID
3. **Fallback not working**: Check `TWILIO_DEVELOPMENT_MODE` setting
4. **Rate limiting**: Wait 1 minute between attempts

### Debug Mode
Set `NODE_ENV=development` to see detailed error messages in API responses.

## 📈 Benefits

- **Development**: Fast, free, reliable testing
- **Production**: Secure, compliant, professional
- **Flexibility**: Easy switching between modes
- **Monitoring**: Full visibility into verification process
- **Cost Control**: No SMS costs during development
