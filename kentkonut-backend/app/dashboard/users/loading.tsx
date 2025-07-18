import { LoadingSkeleton, LoadingTable } from '@/components/ui/loading'

export default function UsersLoading() {
  return (
    <div className="container mx-auto py-10">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-9 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-5 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>      {/* Table Skeleton */}
      <div className="rounded-md border">
        <LoadingTable 
          rows={6} 
          columns={5}
        />
      </div>
    </div>
  )
}
