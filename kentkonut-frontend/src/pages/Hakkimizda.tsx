import DynamicPage from '../components/DynamicPage';
import ProjelerimizImage from '../assets/carousel/projelerimiz.jpg'; // Add this line

const Hakkimizda: React.FC = () => {
  // Fallback content in case the dynamic page fails to load
  const fallbackContent = (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Hakkımızda</h1>
      <div className="text-gray-700">
        <p className="mb-4">
          24 Şubat 2006'da faaliyete geçirilen Kent Konut, bir belediye iktisadi teşekkülüdür. 
          Kocaeli Büyükşehir Belediyesi'nin Kocaeli halkına modern ve kaliteli konut sunduğu bir kurumdur.
        </p>
        <p className="mb-4">
          Bu sayfa geçici olarak bakım modundadır. Lütfen daha sonra tekrar deneyin.
        </p>
      </div>
    </div>
  );

  return <DynamicPage slug="hakkimizda" fallbackContent={fallbackContent} headerImage={ProjelerimizImage} />; // Add headerImage prop
};

export default Hakkimizda;
