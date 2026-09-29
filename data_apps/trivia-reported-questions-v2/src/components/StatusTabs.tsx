import { useMetabaseQuery } from "@metabase/embedding-sdk-react/data-app";

import { ReportCountByStatus } from "../../queries/reports.query";
import type { ReportStatus } from "../types/report";

const TABS: { id: ReportStatus; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "actioned", label: "Actioned" },
  { id: "all", label: "All" },
];

const actionedKey = ReportCountByStatus.source.fields.actioned.name;

export default function StatusTabs({
  value,
  onChange,
}: {
  value: ReportStatus;
  onChange: (status: ReportStatus) => void;
}) {
  const { data, isLoading } = useMetabaseQuery(ReportCountByStatus);

  const counts: Record<ReportStatus, number> = { open: 0, actioned: 0, all: 0 };
  for (const row of data?.rows ?? []) {
    const count = Number(row.count ?? 0);
    counts.all += count;
    if (row[actionedKey] === true) {
      counts.actioned += count;
    } else {
      counts.open += count;
    }
  }

  return (
    <div role="tablist" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {TABS.map((tab) => {
        const isActive = tab.id === value;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            className="trq-tab"
            onClick={() => onChange(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 999,
              border: `1px solid ${isActive ? "#4d96ff" : "#d6dde8"}`,
              background: isActive ? "#4d96ff" : "white",
              color: isActive ? "white" : "#1f2937",
              font: "inherit",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {tab.label}
            <span
              style={{
                minWidth: 22,
                padding: "1px 7px",
                borderRadius: 999,
                fontSize: 12,
                background: isActive ? "rgba(255,255,255,0.25)" : "#eef2f7",
                color: isActive ? "white" : "#4b5563",
              }}
            >
              {isLoading ? "…" : counts[tab.id].toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
