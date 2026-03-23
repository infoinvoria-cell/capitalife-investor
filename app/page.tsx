import { Hero } from "@/components/home/Hero";
import { KpiGrid } from "@/components/home/KpiGrid";
import { PartnerMarquee } from "@/components/home/PartnerMarquee";
import { SimulationCard } from "@/components/home/SimulationCard";
import { AppShell } from "@/components/layout/AppShell";
import { RiskDisclosure } from "@/components/layout/RiskDisclosure";

export default function HomePage() {
  return (
    <AppShell riskNote={<RiskDisclosure />}>
      <Hero />
      <KpiGrid />
      <SimulationCard />
      <PartnerMarquee />
    </AppShell>
  );
}
