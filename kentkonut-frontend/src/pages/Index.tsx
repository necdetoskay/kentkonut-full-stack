import Hero from "../components/Hero";
import FeaturedProjects from "../components/FeaturedProjects";
import AboutSection from "../components/AboutSection";
import ServicesSection from "../components/ServicesSection";
import NewsSection from "../components/NewsSection";
import CompletedProjects from "../components/CompletedProjects";

const Index = () => {
  console.log('Index component rendered');
  return (
    <div className="min-h-screen bg-white">
      {/* Ana başlık: sadece ekran okuyucu ve SEO için */}
      <h1 className="sr-only">Kent Konut - Modern Konut ve Proje Geliştirme</h1>
      <Hero />
      <FeaturedProjects />
      <AboutSection />
      <ServicesSection />
      <NewsSection />
      <CompletedProjects />
    </div>
  );
};

export default Index;