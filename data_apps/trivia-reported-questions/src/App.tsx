import {
  filter,
  orderBy,
  useMetabaseQuery,
} from "@metabase/embedding-sdk-react/data-app";
import { useMemo, useState } from "react";

import { ReportList as ReportListQuery } from "../queries/reports.query";
import QuestionPanel from "./components/QuestionPanel";
import ReportList from "./components/ReportList";
import StatusTabs from "./components/StatusTabs";
import type { Report, ReportStatus } from "./types/report";
import "./styles.css";

const reportFields = ReportListQuery.source.fields;

const EMPTY_MESSAGES: Record<ReportStatus, string> = {
  open: "No open reports — everything has been actioned.",
  actioned: "No actioned reports yet.",
  all: "No reports yet.",
};

export default function App() {
  const [status, setStatus] = useState<ReportStatus>("open");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, error } = useMetabaseQuery(ReportListQuery, {
    filters:
      status === "all"
        ? []
        : [filter(reportFields.actioned, "=", status === "actioned")],
    orderBys: [orderBy(reportFields.createdAt, "desc")],
    limit: 500,
  });

  const reports = useMemo(
    (): Report[] =>
      (data?.rows ?? []).map((row) => ({
        id: String(row[reportFields.id.name]),
        questionId: toNullableString(row[reportFields.questionId.name]),
        reason: toNullableString(row[reportFields.reason.name]),
        createdAt: row[reportFields.createdAt.name],
        actioned: row[reportFields.actioned.name] ?? null,
      })),
    [data],
  );

  // Keep the selection while it's in the list; otherwise show the newest report.
  const selectedReport =
    reports.find((report) => report.id === selectedId) ?? reports[0] ?? null;

  return (
    <div
      style={{
        minHeight: "100vh",
        boxSizing: "border-box",
        padding: 24,
        background: "#f5f7fa",
        color: "#1f2937",
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <header>
        <h1 style={{ margin: 0, fontSize: 24 }}>Reported questions!!!</h1>
        <p style={{ margin: "4px 0 0", color: "#6b7280" }}>
          Trivia questions players have flagged as wrong, confusing, or
          inappropriate.
        </p>
      </header>

      <StatusTabs value={status} onChange={setStatus} />

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", flex: 1 }}>
        <div
          style={{
            flex: "1 1 320px",
            maxWidth: 480,
            maxHeight: "calc(100vh - 200px)",
            minHeight: 240,
            overflowY: "auto",
            background: "white",
            border: "1px solid #e4e9f0",
            borderRadius: 12,
          }}
        >
          <ReportList
            reports={reports}
            isLoading={isLoading}
            error={error}
            selectedId={selectedReport?.id ?? null}
            onSelect={(report) => setSelectedId(report.id)}
            emptyMessage={EMPTY_MESSAGES[status]}
          />
        </div>

        <div
          style={{
            flex: "2 1 400px",
            alignSelf: "flex-start",
            background: "white",
            border: "1px solid #e4e9f0",
            borderRadius: 12,
          }}
        >
          {isLoading ? null : <QuestionPanel report={selectedReport} />}
        </div>
      </div>
    </div>
  );
}

function toNullableString(value: unknown): string | null {
  return value == null || value === "" ? null : String(value);
}
