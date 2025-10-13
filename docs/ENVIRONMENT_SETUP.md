# AgriLink Environment Variables Template
# Copy this file to .env.local and fill in your values

# Database Configuration
DATABASE_URL=your_neon_postgresql_connection_string_here

# Authentication
JWT_SECRET=your_secure_jwt_secret_here

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# SMS Service (Optional - Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here

# Development Settings
NODE_ENV=development
