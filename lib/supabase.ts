import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "THIẾU BIẾN MÔI TRƯỜNG SUPABASE: Kiểm tra file .env.local ngay! Web sẽ không chạy được nếu thiếu các thông số này."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);