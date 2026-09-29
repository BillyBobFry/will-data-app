import { useCallback, useEffect, useState } from "react";

import Spinner from "./Spinner";

const RANDOM_QUESTION_URL = "https://the-trivia-api.com/v2/questions?limit=1";

type TriviaApiQuestion = {
  id: string;
  category: string;
  difficulty: string;
  question: { text: string };
  correctAnswer: string;
  incorrectAnswers: string[];
};

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; question: TriviaApiQuestion; answers: string[] };

export default function RandomQuestion() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [picked, setPicked] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    setPicked(null);

    fetchRandomQuestion(controller.signal)
      .then((question) =>
        setState({
          status: "ready",
          question,
          answers: shuffle([question.correctAnswer, ...question.incorrectAnswers]),
        }),
      )
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      });

    return () => controller.abort();
  }, [requestId]);

  const next = useCallback(() => setRequestId((id) => id + 1), []);

  return (
    <section
      style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #4d96ff 100%)",
        borderRadius: 16,
        padding: 24,
        color: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.85,
          }}
        >
          Random question
        </h2>
        <button onClick={next} style={ghostButtonStyle}>
          New question ↻
        </button>
      </div>

      {state.status === "loading" ? (
        <div style={{ color: "#1f2937", background: "white", borderRadius: 12 }}>
          <Spinner label="Fetching a question…" />
        </div>
      ) : state.status === "error" ? (
        <p style={{ margin: 0, opacity: 0.9 }}>
          Couldn't fetch a question from the Trivia API. {state.message}
        </p>
      ) : (
        <Question
          question={state.question}
          answers={state.answers}
          picked={picked}
          onPick={setPicked}
        />
      )}
    </section>
  );
}

function Question({
  question,
  answers,
  picked,
  onPick,
}: {
  question: TriviaApiQuestion;
  answers: string[];
  picked: string | null;
  onPick: (answer: string) => void;
}) {
  const hasAnswered = picked != null;
  const isCorrect = picked === question.correctAnswer;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <Pill>{formatLabel(question.category)}</Pill>
        <Pill>{formatLabel(question.difficulty)}</Pill>
      </div>

      <p style={{ margin: "0 0 18px", fontSize: 22, fontWeight: 700, lineHeight: 1.35 }}>
        {question.question.text}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 10,
        }}
      >
        {answers.map((answer) => (
          <button
            key={answer}
            disabled={hasAnswered}
            onClick={() => onPick(answer)}
            style={answerStyle(answer, question.correctAnswer, picked)}
          >
            {answer}
          </button>
        ))}
      </div>

      <p aria-live="polite" style={{ margin: "14px 0 0", minHeight: 22, fontWeight: 600 }}>
        {!hasAnswered
          ? ""
          : isCorrect
            ? "✓ Correct!"
            : `✗ Not quite — the answer is ${question.correctAnswer}.`}
      </p>
    </div>
  );
}

function Pill({ children }: { children: string }) {
  return (
    <span
      style={{
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: "rgba(255, 255, 255, 0.18)",
      }}
    >
      {children}
    </span>
  );
}

const ghostButtonStyle = {
  padding: "6px 12px",
  borderRadius: 999,
  border: "1px solid rgba(255, 255, 255, 0.5)",
  background: "transparent",
  color: "white",
  font: "inherit",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
} as const;

function answerStyle(answer: string, correctAnswer: string, picked: string | null) {
  const base = {
    padding: "12px 14px",
    borderRadius: 10,
    border: "2px solid transparent",
    font: "inherit",
    fontSize: 15,
    fontWeight: 600,
    textAlign: "left",
    transition: "background-color 150ms ease, opacity 150ms ease",
  } as const;

  if (picked == null) {
    return { ...base, background: "white", color: "#1f2937", cursor: "pointer" };
  }
  if (answer === correctAnswer) {
    return { ...base, background: "#dcfce7", color: "#166534", borderColor: "#22c55e" };
  }
  if (answer === picked) {
    return { ...base, background: "#fee2e2", color: "#991b1b", borderColor: "#ef4444" };
  }
  return { ...base, background: "white", color: "#6b7280", opacity: 0.6 };
}

async function fetchRandomQuestion(signal: AbortSignal): Promise<TriviaApiQuestion> {
  const response = await fetch(RANDOM_QUESTION_URL, { signal });
  if (!response.ok) {
    throw new Error(`The API returned ${response.status}.`);
  }

  const [question] = (await response.json()) as TriviaApiQuestion[];
  if (!question?.question?.text || !question.correctAnswer) {
    throw new Error("The API returned no question.");
  }
  return { ...question, incorrectAnswers: question.incorrectAnswers ?? [] };
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function formatLabel(value: string): string {
  const text = value.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
