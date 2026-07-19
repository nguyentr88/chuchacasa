import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "Cài đặt tài khoản | Chú Chà Casa",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Fetch fresh user data from DB to ensure we have the latest name/avatar
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      password: true, // We only check if it exists (not null) to show password update UI conditionally
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-heading text-primary-brown mb-8">
          Cài Đặt Tài Khoản
        </h1>
        
        <SettingsClient 
          user={{
            name: user.name || "",
            email: user.email || "",
            image: user.image || "",
            hasPassword: !!user.password,
          }} 
        />
      </div>
    </div>
  );
}
