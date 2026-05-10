import 'dotenv/config';
import { PrismaClient } from '../lib/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ Lỗi: Thiếu biến môi trường DATABASE_URL trong .env');
    return;
  }

  console.log('🔄 Đang kiểm tra kết nối tới Supabase (Prisma 7 + Adapter)...');
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ KẾT NỐI THÀNH CÔNG!');
  } catch (error: any) {
    console.error('❌ KẾT NỐI THẤT BẠI!');
    console.error(`Lỗi: ${error.message}`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
