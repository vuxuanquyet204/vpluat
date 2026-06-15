import { Navbar, Footer } from '@/components/layout';
import { FloatingWidgets } from '@/components/layout/floating-widgets';
import { ChatbotWidget } from '@/features/chatbot';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <FloatingWidgets />
      <ChatbotWidget />
    </>
  );
}
