import { useState } from "react";
import { GovBanner, Header, AlertTicker, Footer, BackToTop } from "./components/chrome";
import { MostWantedSection } from "./components/wanted";
import { Hero, QuickLinks, Newsroom, StatsDashboard, Services, FieldOffices, Scams, TipForm, AboutCareers } from "./components/sections";
import { IC3Channels } from "./components/ic3";
import { SupportCenter } from "./support/SupportCenter";

export default function App() {
  const [globalQuery, setGlobalQuery] = useState("");

  return (
    <div className="min-h-screen bg-white">
      <GovBanner />
      <Header onSearch={setGlobalQuery} />
      <AlertTicker />
      <main>
        <Hero />
        <QuickLinks />
        <MostWantedSection globalQuery={globalQuery} />
        <Newsroom />
        <StatsDashboard />
        <Services />
        <FieldOffices globalQuery={globalQuery} />
        <Scams />
        <IC3Channels />
        <TipForm />
        <AboutCareers />
      </main>
      <Footer />
      <BackToTop />
      <SupportCenter />
    </div>
  );
}
