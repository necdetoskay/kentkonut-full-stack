import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Personel Bulunamadı</h2>
      <p className="text-lg text-gray-600 mb-8 text-center">
        Aramış olduğunuz personel kaydı bulunamadı veya kaldırılmış olabilir.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          Ana Sayfaya Dön
        </Link>
        <Link
          href="/personel"
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Tüm Personel
        </Link>
      </div>
    </div>
  );
}
