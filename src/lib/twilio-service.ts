import twilio from 'twilio';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  verifyServiceSid: string;
}

interface VerificationResult {
  success: boolean;
  method: 'fallback' | 'twilio';
  twilioSid?: string;
  code?: string;
  error?: string;
}

class TwilioService {
  private client: twilio.Twilio | null = null;
  private isDevelopmentMode: boolean;
  private fallbackCode: string;

  constructor() {
    this.isDevelopmentMode = process.env.TWILIO_DEVELOPMENT_MODE === 'true' || process.env.NODE_ENV === 'development';
    this.fallbackCode = process.env.TWILIO_FALLBACK_CODE || '123456';
    
    // Initialize Twilio client only if not in development mode
    if (!this.isDevelopmentMode && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
  }

  /**
   * Send verification code via SMS
   */
  async sendVerificationCode(userId: string, phone: string): Promise<VerificationResult> {
    try {
      if (this.isDevelopmentMode) {
        return await this.sendFallbackCode(userId, phone);
      } else {
        return await this.sendTwilioCode(userId, phone);
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      return {
        success: false,
        method: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Verify the code entered by user
   */
  async verifyCode(userId: string, phone: string, code: string): Promise<VerificationResult> {
    try {
      // Get the verification record
      const verificationRecord = await sql`
        SELECT * FROM verification_codes 
        WHERE "userId" = ${userId} 
        AND phone = ${phone} 
        AND "expiresAt" > NOW()
        ORDER BY "createdAt" DESC
        LIMIT 1
      `;

      if (verificationRecord.length === 0) {
        return {
          success: false,
          method: 'fallback',
          error: 'No active verification found'
        };
      }

      const record = verificationRecord[0];

      // Check if it's a fallback verification
      if (record.verification_method === 'fallback') {
        return await this.verifyFallbackCode(record, code);
      } else {
        return await this.verifyTwilioCode(record, code);
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      return {
        success: false,
        method: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Development fallback: Generate and store a random code
   */
  private async sendFallbackCode(userId: string, phone: string): Promise<VerificationResult> {
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    await sql`
      INSERT INTO verification_codes (
        "userId", phone, code, "expiresAt", "createdAt", 
        verification_method, twilio_status, attempts
      )
      VALUES (
        ${userId}, ${phone}, ${verificationCode}, 
        NOW() + INTERVAL '10 minutes', NOW(),
        'fallback', 'pending', 0
      )
      ON CONFLICT ("userId") 
      DO UPDATE SET 
        code = ${verificationCode},
        "expiresAt" = NOW() + INTERVAL '10 minutes',
        "createdAt" = NOW(),
        verification_method = 'fallback',
        twilio_status = 'pending',
        attempts = 0
    `;

    console.log(`🔧 [FALLBACK] Verification code for ${phone}: ${verificationCode}`);
    console.log(`🔧 [FALLBACK] Also accepts: ${this.fallbackCode}`);

    return {
      success: true,
      method: 'fallback',
      code: verificationCode
    };
  }

  /**
   * Production: Send real SMS via Twilio
   */
  private async sendTwilioCode(userId: string, phone: string): Promise<VerificationResult> {
    if (!this.client) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const verification = await this.client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
        .verifications
        .create({
          to: phone,
          channel: 'sms'
        });

      await sql`
        INSERT INTO verification_codes (
          "userId", phone, "expiresAt", "createdAt",
          verification_method, twilio_sid, twilio_status, attempts
        )
        VALUES (
          ${userId}, ${phone},
          NOW() + INTERVAL '10 minutes', NOW(),
          'twilio', ${verification.sid}, 'pending', 0
        )
        ON CONFLICT ("userId") 
        DO UPDATE SET 
          "expiresAt" = NOW() + INTERVAL '10 minutes',
          "createdAt" = NOW(),
          verification_method = 'twilio',
          twilio_sid = ${verification.sid},
          twilio_status = 'pending',
          attempts = 0
      `;

      console.log(`📱 [TWILIO] SMS sent to ${phone}, SID: ${verification.sid}`);

      return {
        success: true,
        method: 'twilio',
        twilioSid: verification.sid
      };
    } catch (error) {
      console.error('Twilio API error:', error);
      throw error;
    }
  }

  /**
   * Verify fallback code (development)
   */
  private async verifyFallbackCode(record: any, code: string): Promise<VerificationResult> {
    const isValidCode = code === record.code || code === this.fallbackCode;
    
    if (isValidCode) {
      // Update verification status
      await sql`
        UPDATE verification_codes 
        SET 
          twilio_status = 'approved',
          attempts = attempts + 1,
          last_attempt_at = NOW()
        WHERE "userId" = ${record.userId} AND code = ${record.code}
      `;

      return {
        success: true,
        method: 'fallback'
      };
    } else {
      // Increment attempts
      await sql`
        UPDATE verification_codes 
        SET 
          attempts = attempts + 1,
          last_attempt_at = NOW()
        WHERE "userId" = ${record.userId} AND code = ${record.code}
      `;

      return {
        success: false,
        method: 'fallback',
        error: 'Invalid verification code'
      };
    }
  }

  /**
   * Verify Twilio code (production)
   */
  private async verifyTwilioCode(record: any, code: string): Promise<VerificationResult> {
    if (!this.client) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const verificationCheck = await this.client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
        .verificationChecks
        .create({
          to: record.phone,
          code: code
        });

      const isApproved = verificationCheck.status === 'approved';

      // Update verification status
      await sql`
        UPDATE verification_codes 
        SET 
          twilio_status = ${verificationCheck.status},
          attempts = attempts + 1,
          last_attempt_at = NOW()
        WHERE "userId" = ${record.userId} AND twilio_sid = ${record.twilio_sid}
      `;

      return {
        success: isApproved,
        method: 'twilio',
        twilioSid: record.twilio_sid,
        error: isApproved ? undefined : 'Invalid verification code'
      };
    } catch (error) {
      console.error('Twilio verification error:', error);
      return {
        success: false,
        method: 'twilio',
        error: 'Verification failed'
      };
    }
  }

  /**
   * Get verification statistics
   */
  async getVerificationStats(): Promise<any> {
    const stats = await sql`
      SELECT 
        verification_method,
        twilio_status,
        COUNT(*) as count,
        AVG(attempts) as avg_attempts
      FROM verification_codes 
      WHERE "createdAt" > NOW() - INTERVAL '24 hours'
      GROUP BY verification_method, twilio_status
    `;

    return stats;
  }
}

export const twilioService = new TwilioService();
export default twilioService;
