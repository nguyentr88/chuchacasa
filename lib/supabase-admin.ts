import { createClient } from '@supabase/supabase-js';

export const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("THIẾU BIẾN MÔI TRƯỜNG: Vui lòng dán SUPABASE_SERVICE_ROLE_KEY vào file .env!");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};
