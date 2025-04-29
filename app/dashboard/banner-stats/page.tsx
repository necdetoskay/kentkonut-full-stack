import { Metadata } from "next";
import { BannerStatsTable } from "./components/banner-stats-table";
import { AnalyticsChart } from "./components/analytics-chart";

export const metadata: Metadata = {
  title: "Banner İstatistikleri",
  description: "Banner Görüntülenme ve Tıklama İstatistikleri",
};

export default function BannerStatsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Banner İstatistikleri</h1>
      </div>
      
      <div className="grid gap-6">
        <AnalyticsChart />
        <BannerStatsTable />
      </div>
    </div>
  );
} 