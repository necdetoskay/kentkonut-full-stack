import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BannerGroupForm } from "@/components/banners/BannerGroupForm";

export const metadata: Metadata = {
  title: "Yeni Banner Grubu",
  description: "Yeni bir banner grubu oluşturun",
};

export default async function CreateBannerGroupPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Yeni Banner Grubu</h2>
        <p className="text-muted-foreground">
          Web sitesinde görüntülenecek yeni bir banner grubu oluşturun
        </p>
      </div>
      <div className="mx-auto max-w-2xl">
        <BannerGroupForm />
      </div>
    </div>
  );
} 