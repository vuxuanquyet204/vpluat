import { Navbar } from '@/components/layout';
import {
  HeroSection,
  ServicesSection,
  LawyersSection,
  WhyChooseUsSection,
  TestimonialsSection,
  NewsSection,
  FaqSection,
  ContactSection,
} from '@/features/home';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <LawyersSection />
        <WhyChooseUsSection />
        <TestimonialsSection />
        <NewsSection />
        <FaqSection />
        <ContactSection />
      </main>
    </>
  );
}
