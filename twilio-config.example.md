# Twilio Configuration

## Environment Variables

Add these to your `.env.local` file:

```bash
# Development (Fallback mode)
TWILIO_DEVELOPMENT_MODE=true
TWILIO_FALLBACK_CODE=123456

# Twilio Production Credentials (only needed for production)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid

# Environment
NODE_ENV=development
```

## Database Setup

Run the SQL script to prepare your database:

```bash
# Connect to your database and run:
psql $DATABASE_URL -f prepare-twilio-database.sql
```
