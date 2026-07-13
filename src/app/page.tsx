import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { EstimatorSection } from "@/components/EstimatorSection";
import { HowItWorks } from "@/components/HowItWorks";
import { ServiceArea } from "@/components/ServiceArea";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Services />
        <EstimatorSection />
        <HowItWorks />
        <ServiceArea />
      </main>
      <Footer />
    </>
  );
}
