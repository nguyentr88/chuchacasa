import 'dotenv/config';
import { PrismaClient } from '../lib/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Lỗi: Thiếu biến môi trường DATABASE_URL trong .env');
    return;
  }

  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // Thông số tài khoản admin mặc định hoặc lấy từ tham số dòng lệnh
  const email = process.argv[2] || 'admin@chucha.casa';
  const password = process.argv[3] || 'Admin@123456';
  const name = 'Chu Cha Admin';

  try {
    console.log(`🔄 Đang tìm kiếm tài khoản với email: ${email}...`);
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`ℹ️ Phát hiện người dùng đã tồn tại. Đang tiến hành thăng cấp lên ADMIN...`);
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
      });
      console.log(`✅ THĂNG CẤP THÀNH CÔNG! Tài khoản ${email} đã có quyền ADMIN.`);
    } else {
      console.log(`ℹ️ Người dùng chưa tồn tại. Đang tiến hành khởi tạo tài khoản ADMIN mới...`);
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      console.log(`✅ TẠO ADMIN THÀNH CÔNG!`);
      console.log(`   - Email: ${email}`);
      console.log(`   - Mật khẩu: ${password}`);
      console.log(`   - Tên: ${newUser.name}`);
    }
  } catch (error: any) {
    console.error('❌ LỖI TRONG QUÁ TRÌNH KHỞI TẠO ADMIN:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
