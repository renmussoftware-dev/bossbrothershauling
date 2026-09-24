import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { MeetTheBrothers } from "@/components/MeetTheBrothers";
import { EstimatorSection } from "@/components/EstimatorSection";
import { HowItWorks } from "@/components/HowItWorks";
import { RecentWork } from "@/components/RecentWork";
import { ServiceArea } from "@/components/ServiceArea";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Services />
        {/* Faces before the ask — the estimator wants a phone number next. */}
        <MeetTheBrothers />
        <EstimatorSection />
        <HowItWorks />
        <RecentWork />
        <ServiceArea />
      </main>
      <Footer />
    </>
  );
}
