"use client";

interface PageFooterProps {
  updatedAt: string;
}

export function PageFooter({ updatedAt }: PageFooterProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <footer className="bg-white border-t mt-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500 text-sm">
          <p>Son güncelleme: {formatDate(updatedAt)}</p>
        </div>
      </div>
    </footer>
  );
}
