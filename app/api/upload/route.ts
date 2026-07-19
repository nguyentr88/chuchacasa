import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    // Public endpoint: Ai cũng có thể upload ảnh (chỉ chấp nhận ảnh và tối đa 5MB)
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file" }, { status: 400 });
    }

    // Chỉ cho phép ảnh
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Chỉ chấp nhận file hình ảnh" }, { status: 400 });
    }

    // Giới hạn 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File ảnh tối đa 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Tạo tên file unique: timestamp + tên gốc đã làm sạch
    const ext = path.extname(file.name);
    const safeName = file.name
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase()
      .substring(0, 40);
    const filename = `${Date.now()}-${safeName}${ext}`;

    const supabaseAdmin = getSupabaseAdmin();

    // Upload lên Supabase Storage (bucket 'uploads') với quyền Admin
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from("uploads") // Tên bucket trên Supabase
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError);
      return NextResponse.json({ 
        error: "Lỗi lưu trữ ảnh: Không thể tải ảnh lên máy chủ." 
      }, { status: 500 });
    }

    // Lấy public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("uploads")
      .getPublicUrl(filename);

    const url = publicUrlData.publicUrl;

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải ảnh lên." }, { status: 500 });
  }
}
