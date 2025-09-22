"use client";

import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Link as LinkIcon } from "lucide-react";
export default function QuickLinksPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Kurumsal", href: "/dashboard/kurumsal" },
            { label: "Hızlı Bağlantılar", href: "/dashboard/kurumsal/hizli-baglanti" }
          ]}
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-yellow-600 mb-2">
          <LinkIcon className="h-12 w-12 mx-auto mb-4" />
        </div>
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Hızlı Bağlantılar Geçici Olarak Devre Dışı
        </h3>
        <p className="text-yellow-700">
          Bu özellik şu anda geliştirme aşamasındadır. Yakında tekrar aktif olacaktır.
        </p>
      </div>
    </div>
  );
}
