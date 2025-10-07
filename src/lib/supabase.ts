import { createClient } from '@supabase/supabase-js';
import ENV from '../config/env';

// Create Supabase client
export const supabase = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY
);

// Export for compatibility
export default supabase;

