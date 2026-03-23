import { AppShell } from "@/components/layout/AppShell";
import { RiskDisclosure } from "@/components/layout/RiskDisclosure";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default function StrategiePage() {
  return (
    <AppShell riskNote={<RiskDisclosure />}>
      <TopBar />

      <Card className="p-3">
        <SectionTitle
          eyebrow="Strategie"
          title="Strategie-Architektur"
          subtitle="Ein vorbereiteter Bereich fuer Multi-Strategie-Logik und Allokation."
        />
      </Card>

      <Card className="p-3">
        <p className="text-[12px] leading-[1.45] text-white/65">
          Hier kann spaeter die Erklaerung der Strategie-Bausteine, der Instrumente und des
          Risiko-Managements eingebettet werden.
        </p>
      </Card>
    </AppShell>
  );
}
