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
  );
}
