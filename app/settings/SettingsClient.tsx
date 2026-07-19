"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { updateProfileAction, updatePasswordAction } from "@/app/actions/user";
import { compressImage } from "@/lib/image-utils";
import { Loader2, Camera, User, Lock, Save } from "lucide-react";
import { useSession } from "next-auth/react";

interface SettingsClientProps {
  user: {
    name: string;
    email: string;
    image: string;
    hasPassword: boolean;
  };
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();
  const { update } = useSession();
  
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // State Profile
  const [name, setName] = useState(user.name || "");
  const [avatar, setAvatar] = useState(user.image || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Xử lý Upload Avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh.");
      return;
    }

    setIsUploading(true);
    try {
      const compressedFile = await compressImage(file, 800, 0.8);
      const formData = new FormData();
      formData.append("file", compressedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload thất bại");

      setAvatar(data.url);
      toast.success("Tải ảnh thành công, hãy bấm Lưu để cập nhật.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Submit Lưu Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Vui lòng nhập tên.");

    setIsSavingProfile(true);
    const res = await updateProfileAction({ name, image: avatar });
    setIsSavingProfile(false);

    if (res.success) {
      toast.success(res.message);
      await update({ name, image: avatar }); // Cập nhật session client
      router.refresh(); // Cập nhật Server Component
    } else {
      toast.error(res.message);
    }
  };

  // Submit Lưu Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user.hasPassword && !currentPassword) {
      return toast.error("Vui lòng nhập mật khẩu hiện tại.");
    }
    if (newPassword.length < 6) {
      return toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Mật khẩu xác nhận không khớp.");
    }

    setIsSavingPassword(true);
    const res = await updatePasswordAction({
      currentPassword: user.hasPassword ? currentPassword : undefined,
      newPassword,
    });
    setIsSavingPassword(false);

    if (res.success) {
      toast.success(res.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Sidebar Tabs */}
      <div className="md:col-span-1 space-y-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${
            activeTab === "profile"
              ? "bg-primary-brown text-white shadow-md"
              : "bg-white/50 text-primary-brown/60 hover:bg-white hover:text-primary-brown border border-primary-brown/5"
          }`}
        >
          <User size={18} />
          Hồ sơ cá nhân
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${
            activeTab === "security"
              ? "bg-primary-brown text-white shadow-md"
              : "bg-white/50 text-primary-brown/60 hover:bg-white hover:text-primary-brown border border-primary-brown/5"
          }`}
        >
          <Lock size={18} />
          Bảo mật & Mật khẩu
        </button>
      </div>

      {/* Nội dung Tab */}
      <div className="md:col-span-3">
        {activeTab === "profile" && (
          <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-8 border border-primary-brown/5 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-xl font-heading text-primary-brown mb-6">Thông tin Hồ sơ</h2>
            
            <form onSubmit={handleSaveProfile} className="space-y-8">
              {/* Ảnh đại diện */}
              <div className="flex flex-col items-center sm:items-start gap-4">
                <label className="text-sm font-extrabold tracking-widest text-primary-brown/50 uppercase">Ảnh đại diện</label>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md group">
                    <Image
                      src={avatar || "/logo/chucha-avatar.jpg"}
                      alt="Avatar"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="96px"
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-primary-brown/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                    >
                      {isUploading ? <Loader2 className="animate-spin text-white" size={24} /> : <Camera className="text-white" size={24} />}
                    </div>
                  </div>
                  <div className="text-sm text-primary-brown/60">
                    <p>Nhấp vào ảnh để thay đổi.</p>
                    <p className="text-xs opacity-70">JPG, PNG. Tối đa 5MB.</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Tên & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-extrabold tracking-widest text-primary-brown/50 uppercase">Tên hiển thị</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-3.5 bg-white border-2 border-primary-brown/10 rounded-2xl focus:border-accent-red outline-none transition-all text-primary-brown font-semibold shadow-sm"
                    placeholder="Tên của bạn"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-extrabold tracking-widest text-primary-brown/50 uppercase">Email (Đăng nhập)</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-5 py-3.5 bg-primary-brown/5 border-2 border-primary-brown/5 rounded-2xl outline-none text-primary-brown/60 font-semibold cursor-not-allowed"
                  />
                  <p className="text-xs text-primary-brown/40 px-2">Email không thể thay đổi.</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSavingProfile || isUploading}
                  className="flex items-center gap-2 px-8 py-3.5 bg-accent-red hover:bg-accent-red/90 text-white rounded-full font-bold shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingProfile ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "security" && (
          <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-8 border border-primary-brown/5 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-xl font-heading text-primary-brown mb-6">Đổi Mật Khẩu</h2>
            
            <form onSubmit={handleSavePassword} className="space-y-6 max-w-md">
              {user.hasPassword && (
                <div className="space-y-2">
                  <label className="text-sm font-extrabold tracking-widest text-primary-brown/50 uppercase">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-5 py-3.5 bg-white border-2 border-primary-brown/10 rounded-2xl focus:border-accent-red outline-none transition-all text-primary-brown font-semibold shadow-sm"
                    placeholder="Nhập mật khẩu cũ"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-extrabold tracking-widest text-primary-brown/50 uppercase">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white border-2 border-primary-brown/10 rounded-2xl focus:border-accent-red outline-none transition-all text-primary-brown font-semibold shadow-sm"
                  placeholder="Ít nhất 6 ký tự"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-extrabold tracking-widest text-primary-brown/50 uppercase">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white border-2 border-primary-brown/10 rounded-2xl focus:border-accent-red outline-none transition-all text-primary-brown font-semibold shadow-sm"
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </div>

              <div className="flex justify-start pt-4">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="flex items-center gap-2 px-8 py-3.5 bg-primary-brown hover:bg-primary-brown/90 text-white rounded-full font-bold shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingPassword ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
