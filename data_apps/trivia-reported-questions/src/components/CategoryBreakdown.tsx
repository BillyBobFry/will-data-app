import {
  filter,
  useMetabaseQuery,
} from "@metabase/embedding-sdk-react/data-app";
import { useMemo } from "react";

import {
  QuestionCategories,
  ReportCountsByQuestion,
} from "../../queries/categories.query";
import type { ReportStatus } from "../types/report";
import Spinner from "./Spinner";

const reportFields = ReportCountsByQuestion.source.fields;
const questionFields = QuestionCategories.source.fields;

const UNKNOWN_CATEGORY = "Unknown";

type CategoryCount = { category: string; count: number };

// `_id = a OR b OR …`. `filter()` takes one value per clause (an array becomes
// a single, invalid literal), but its clause type allows any number of literal
// arguments, so extend the one it builds.
function questionIdIsAnyOf(values: string[]) {
  const clause = filter(questionFields.id2062083, "=", values[0] ?? "");
  return {
    ...clause,
    args: [
      clause.args[0],
      ...values.map((value) => ({ type: "literal" as const, value })),
    ] as const,
  };
}

export default function CategoryBreakdown({ status }: { status: ReportStatus }) {
  const counts = useMetabaseQuery(ReportCountsByQuestion, {
    filters:
      status === "all"
        ? []
        : [filter(reportFields.actioned, "=", status === "actioned")],
  });
  // Only look up the reported questions: the full table is far larger than a
  // query's row limit.
  const questionIds = useMemo(
    () => [
      ...new Set(
        (counts.data?.rows ?? []).flatMap((row) => {
          const questionId = row[reportFields.questionId.name];
          return questionId == null ? [] : [String(questionId)];
        }),
      ),
    ],
    [counts.data],
  );
  const categories = useMetabaseQuery(QuestionCategories, {
    filters: [questionIdIsAnyOf(questionIds)],
    enabled: questionIds.length > 0,
  });

  const rows = useMemo((): CategoryCount[] => {
    const categoryById = new Map<string, string>();
    for (const row of categories.data?.rows ?? []) {
      const category = row[questionFields.category.name];
      categoryById.set(
        String(row[questionFields.id2062083.name]),
        category == null || category === "" ? UNKNOWN_CATEGORY : String(category),
      );
    }

    const totals = new Map<string, number>();
    for (const row of counts.data?.rows ?? []) {
      const questionId = row[reportFields.questionId.name];
      const category =
        (questionId == null ? undefined : categoryById.get(String(questionId))) ??
        UNKNOWN_CATEGORY;
      totals.set(category, (totals.get(category) ?? 0) + Number(row.count ?? 0));
    }

    return [...totals]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
  }, [counts.data, categories.data]);

  const isLoading =
    counts.isLoading ||
    categories.isLoading ||
    (questionIds.length > 0 && !categories.data && !categories.error);
  const error = counts.error ?? categories.error;
  const max = rows[0]?.count ?? 0;

  return (
    <section
      style={{
        background: "white",
        border: "1px solid #e4e9f0",
        borderRadius: 12,
        padding: 20,
      }}
    >
      <h2 style={{ margin: "0 0 14px", fontSize: 16 }}>Reports by category</h2>

      {isLoading ? (
        <Spinner label="Loading categories…" />
      ) : error ? (
        <p style={{ margin: 0, color: "#b42318" }}>
          Couldn't load the category breakdown.{" "}
          {error instanceof Error ? error.message : ""}
        </p>
      ) : rows.length === 0 ? (
        <p style={{ margin: 0, color: "#6b7280" }}>No reports to break down.</p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gridTemplateColumns: "minmax(120px, max-content) 1fr max-content",
            alignItems: "center",
            gap: "8px 12px",
            maxHeight: 260,
            overflowY: "auto",
            fontSize: 14,
          }}
        >
          {rows.map(({ category, count }) => (
            <li key={category} style={{ display: "contents" }}>
              <span style={{ color: "#1f2937" }}>{category}</span>
              <span
                aria-hidden
                style={{
                  height: 10,
                  borderRadius: 999,
                  background: "#eef2f7",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    display: "block",
                    height: "100%",
                    width: `${max > 0 ? (count / max) * 100 : 0}%`,
                    borderRadius: 999,
                    background: "#4d96ff",
                  }}
                />
              </span>
              <span style={{ color: "#4b5563", fontVariantNumeric: "tabular-nums" }}>
                {count.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
