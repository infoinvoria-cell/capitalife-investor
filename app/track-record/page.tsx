import { buildTrackRecordModel } from "@/components/track-record/metrics";
import TrackRecordPage from "@/components/pages/TrackRecordPage";
import { AppShell } from "@/components/layout/AppShell";
import { RiskDisclosure } from "@/components/layout/RiskDisclosure";
import { loadTrackRecordTrades } from "@/lib/trackRecordStore";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Page() {
  const trades = await loadTrackRecordTrades();
  const model = buildTrackRecordModel(trades);

  return (
    <AppShell
      riskNote={<RiskDisclosure />}
      contentClassName="track-record-content"
      disableDefaultContentPadding
      transitionClassName="page-stack pb-1"
    >
      <TrackRecordPage initialModel={model} />
    </AppShell>
  );
}
