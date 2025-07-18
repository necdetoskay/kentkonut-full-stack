
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-16 bg-kentblue text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/20"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-white/20"></div>
      </div>
      
      <div className="kent-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Hayalinizdeki Eve Kavuşmak İçin</h2>
            <p className="text-white/90 mb-8 text-lg">
              Kent Konut projelerimizi yakından incelemek, detaylı bilgi almak veya 
              projelerimizdeki konutları görmek için hemen bizimle iletişime geçin.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-kentgold hover:bg-kentgold/90 text-black"
                asChild
              >
                <a href="/iletisim" className="flex items-center">
                  Bize Ulaşın <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-kentblue"
                asChild
              >
                <a href="tel:+901234567890" className="flex items-center">
                  <Phone className="mr-2 h-4 w-4" /> +90 (123) 456 7890
                </a>
              </Button>
            </div>
          </div>
          
          <div className="bg-white/10 p-6 md:p-8 rounded-lg backdrop-blur-sm border border-white/20">
            <h3 className="text-xl md:text-2xl font-bold mb-6 text-white">Satış Ofisimiz</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-kentgold mb-1">Kent Konut Merkez Ofis</h4>
                <p className="text-white/90">
                  Barbaros Bulvarı No:123, <br />
                  Beşiktaş, İstanbul
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-kentgold mb-1">Çalışma Saatlerimiz</h4>
                <p className="text-white/90">
                  Pazartesi - Cumartesi: 09:00 - 19:00 <br />
                  Pazar: 10:00 - 17:00
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-kentgold mb-1">İletişim</h4>
                <p className="text-white/90">
                  Tel: +90 (123) 456 7890 <br />
                  Email: info@kentkonut.com.tr
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
