
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const AboutSection = () => {
  return (
    <section className="py-16">
      <div className="kent-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image Column */}
          <div className="relative">
            <div className="relative z-10 rounded-lg overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1973&q=80"
                alt="Kent Konut Ofisi"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-64 h-40 bg-kentgold/20 rounded-lg -z-10"></div>
            <div className="absolute -top-6 -left-6 w-40 h-40 bg-kentblue/10 rounded-lg -z-10"></div>
          </div>

          {/* Content Column */}
          <div className="animate-fade-in">
            <h2 className="section-title">Hakkımızda</h2>
            <p className="text-gray-700 mb-6">
              Kent Konut, 1995 yılından bu yana inşaat ve gayrimenkul sektöründe faaliyet gösteren, 
              müşteri memnuniyetini ön planda tutan, güvenilir ve yenilikçi bir firma olarak hizmet vermektedir.
            </p>
            <p className="text-gray-700 mb-6">
              Bugüne kadar İstanbul, Ankara, İzmir ve Bodrum başta olmak üzere Türkiye'nin çeşitli 
              bölgelerinde, modern mimari yaklaşımlar ve yüksek kalite standartlarıyla hayata 
              geçirdiğimiz projelerimizle binlerce ailenin yaşam kalitesini artırmaktan gurur duyuyoruz.
            </p>

            {/* Key Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <KeyFeature text="25+ Yıllık Deneyim" />
              <KeyFeature text="10.000+ Mutlu Müşteri" />
              <KeyFeature text="50+ Tamamlanan Proje" />
              <KeyFeature text="Ödüllü Tasarımlar" />
            </div>

            <Button 
              className="bg-kentblue hover:bg-kentblue/90 text-white"
              asChild
            >
              <a href="/kurumsal">Şirketimizi Tanıyın</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const KeyFeature = ({ text }: { text: string }) => (
  <div className="flex items-center space-x-2">
    <CheckCircle className="h-5 w-5 text-kentgold" />
    <span className="text-gray-700">{text}</span>
  </div>
);

export default AboutSection;
