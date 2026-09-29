import {
  filter,
  useMetabaseQuery,
} from "@metabase/embedding-sdk-react/data-app";
import type { ReactNode } from "react";

import { QuestionDetail } from "../../queries/questions.query";
import { formatDateTime, toStringList } from "../lib/format";
import type { Report } from "../types/report";
import { StatusBadge } from "./ReportList";
import Spinner from "./Spinner";

const fields = QuestionDetail.source.fields;

export default function QuestionPanel({ report }: { report: Report | null }) {
  const questionId = report?.questionId ?? null;

  const { data, isLoading, error } = useMetabaseQuery(QuestionDetail, {
    filters: [filter(fields.id2062083, "=", questionId ?? "")],
    limit: 1,
    enabled: questionId != null,
  });

  if (!report) {
    return (
      <p style={{ padding: 24, color: "#6b7280" }}>
        Select a report to see the question.
      </p>
    );
  }

  const question = data?.rows[0];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <section>
        <SectionLabel>Report</SectionLabel>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
            fontSize: 13,
            color: "#6b7280",
          }}
        >
          <StatusBadge actioned={report.actioned} />
          <span>{formatDateTime(report.createdAt)}</span>
        </div>
        <p style={{ margin: 0, fontSize: 16, color: "#1f2937", lineHeight: 1.5 }}>
          {report.reason || "No reason given"}
        </p>
      </section>

      <section>
        <SectionLabel>Question</SectionLabel>
        {questionId == null ? (
          <p style={{ margin: 0, color: "#6b7280" }}>
            This report isn't linked to a question.
          </p>
        ) : isLoading ? (
          <Spinner label="Loading question…" />
        ) : error ? (
          <p style={{ margin: 0, color: "#b42318" }}>
            Couldn't load the question.{" "}
            {error instanceof Error ? error.message : ""}
          </p>
        ) : !question ? (
          <p style={{ margin: 0, color: "#6b7280" }}>
            No question found with ID <code>{questionId}</code>. It may have
            been deleted.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 600,
                color: "#1f2937",
                lineHeight: 1.4,
              }}
            >
              {String(question[fields.question.name] ?? "")}
            </p>

            <AnswerList
              correct={question[fields.correctAnswer.name]}
              incorrect={toStringList(question[fields.incorrectAnswers.name])}
            />

            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "max-content 1fr",
                gap: "6px 16px",
                margin: 0,
                fontSize: 14,
              }}
            >
              <Detail label="Category" value={question[fields.category.name]} />
              <Detail label="Difficulty" value={question[fields.difficulty.name]} />
              <Detail label="Type" value={question[fields.type.name]} />
              <Detail label="State" value={question[fields.state.name]} />
              <Detail
                label="Tags"
                value={toStringList(question[fields.tags.name]).join(", ")}
              />
              <Detail label="Question ID" value={questionId} mono />
            </dl>
          </div>
        )}
      </section>
    </div>
  );
}

function AnswerList({
  correct,
  incorrect,
}: {
  correct: unknown;
  incorrect: string[];
}) {
  const answerStyle = {
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 14,
  };

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
      {correct != null && (
        <li
          style={{
            ...answerStyle,
            background: "#ecfdf3",
            border: "1px solid #abefc6",
            color: "#067647",
            fontWeight: 600,
          }}
        >
          ✓ {String(correct)}
        </li>
      )}
      {incorrect.map((answer, index) => (
        <li
          key={index}
          style={{
            ...answerStyle,
            background: "#f8fafc",
            border: "1px solid #e4e9f0",
            color: "#4b5563",
          }}
        >
          {answer}
        </li>
      ))}
    </ul>
  );
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: unknown;
  mono?: boolean;
}) {
  const text = value == null || value === "" ? "—" : String(value);
  return (
    <>
      <dt style={{ color: "#6b7280" }}>{label}</dt>
      <dd
        style={{
          margin: 0,
          color: "#1f2937",
          fontFamily: mono ? "ui-monospace, monospace" : undefined,
          wordBreak: "break-all",
        }}
      >
        {text}
      </dd>
    </>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        margin: "0 0 10px",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "#6b7280",
      }}
    >
      {children}
    </h2>
  );
}
