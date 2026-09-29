import { formatDateTime } from "../lib/format";
import type { Report } from "../types/report";
import Spinner from "./Spinner";

export default function ReportList({
  reports,
  isLoading,
  error,
  selectedId,
  onSelect,
  emptyMessage,
}: {
  reports: Report[];
  isLoading: boolean;
  error: unknown;
  selectedId: string | null;
  onSelect: (report: Report) => void;
  emptyMessage: string;
}) {
  if (isLoading) {
    return <Spinner label="Loading reports…" />;
  }

  if (error) {
    return (
      <p style={{ padding: 24, color: "#b42318" }}>
        Couldn't load reports. {error instanceof Error ? error.message : ""}
      </p>
    );
  }

  if (reports.length === 0) {
    return <p style={{ padding: 24, color: "#6b7280" }}>{emptyMessage}</p>;
  }

  return (
    <ul
      role="listbox"
      aria-label="Reports"
      style={{ listStyle: "none", margin: 0, padding: 0 }}
    >
      {reports.map((report) => (
        <li
          key={report.id}
          role="option"
          tabIndex={0}
          aria-selected={report.id === selectedId}
          className="trq-report-row"
          onClick={() => onSelect(report)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelect(report);
            }
          }}
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #eef2f7",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 4,
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            <span>{formatDateTime(report.createdAt)}</span>
            <StatusBadge actioned={report.actioned} />
          </div>
          <div style={{ color: "#1f2937", lineHeight: 1.4 }}>
            {report.reason || "No reason given"}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function StatusBadge({ actioned }: { actioned: boolean | null }) {
  const isActioned = actioned === true;
  return (
    <span
      style={{
        flexShrink: 0,
        padding: "1px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: isActioned ? "#eef2f7" : "#fff4e5",
        color: isActioned ? "#4b5563" : "#b54708",
      }}
    >
      {isActioned ? "Actioned" : "Open"}
    </span>
  );
}
