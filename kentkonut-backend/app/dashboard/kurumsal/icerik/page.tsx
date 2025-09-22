"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Target, FileText, Calendar } from "lucide-react"
import Link from "next/link"
import { Breadcrumb } from "@/components/ui/breadcrumb"

export default function CorporateContentPage() {
  const contentModules = [
    {
      title: "Vizyon & Misyon",
      description: "Kurumsal vizyon ve misyon beyanlarını yönetin",
      icon: Eye,
      href: "/dashboard/kurumsal/visyon-misyon",
      color: "bg-blue-500",
      features: ["Vizyon tanımı", "Misyon tanımı", "Rich text editör", "Görsel ekleme"]
    },
    {
      title: "Strateji & Hedefler",
      description: "Kurumsal strateji ve hedefleri yönetin",
      icon: Target,
      href: "/dashboard/kurumsal/icerik/strategy-goals",
      color: "bg-green-500",
      features: ["Strateji planları", "Hedef belirleme", "İlerleme takibi", "Raporlama"]
    },
    {
      title: "Kurumsal Değerler",
      description: "Şirket değerlerini ve prensiplerinizi yönetin",
      icon: FileText,
      href: "/dashboard/kurumsal/icerik/values",
      color: "bg-purple-500",
      features: ["Değer tanımları", "Prensip açıklamaları", "Kültür rehberi"],
      isComingSoon: true
    },
    {
      title: "Kurumsal Tarihçe",
      description: "Şirket tarihçesi ve kilometre taşlarını yönetin",
      icon: Calendar,
      href: "/dashboard/kurumsal/icerik/history",
      color: "bg-orange-500",
      features: ["Tarihçe timeline", "Kilometre taşları", "Önemli olaylar"],
      isComingSoon: true
    }
  ]

  return (
    <div className="p-6">
      <Breadcrumb
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Kurumsal", href: "/dashboard/kurumsal" },
          { name: "Kurumsal İçerik", href: "/dashboard/kurumsal/icerik" }
        ]}
        className="mb-4"
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Kurumsal İçerik Yönetimi</h1>
        <p className="text-gray-600 mt-2">Şirketinizin kurumsal içeriklerini yönetin ve düzenleyin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contentModules.map((module, index) => (
          <Card key={index} className="relative overflow-hidden">
            {module.isComingSoon && (
              <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                Yakında
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${module.color} text-white`}>
                  <module.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Özellikler</h4>
                  <ul className="space-y-1">
                    {module.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-sm text-gray-600 flex items-center">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  {module.isComingSoon ? (
                    <Button disabled className="w-full">
                      Yakında Gelecek
                    </Button>
                  ) : (
                    <Link href={module.href}>
                      <Button className="w-full">
                        {module.title} Yönetimi
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
