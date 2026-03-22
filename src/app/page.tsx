import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Niches from "@/components/landing/Niches";
import ChatDemo from "@/components/landing/ChatDemo";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Hero />
      <HowItWorks />
      <Niches />
      <ChatDemo />
      {/* Spacer for the CTA banner that overflows from footer */}
      <div className="h-16 bg-white" />
      <Footer />
    </main>
  );
}
