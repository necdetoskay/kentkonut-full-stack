import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kent Konut - Sayfalar',
  description: 'Kent Konut web sitesi sayfaları',
}

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}