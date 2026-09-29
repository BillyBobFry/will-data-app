export type ReportStatus = "open" | "actioned" | "all";

export type Report = {
  id: string;
  questionId: string | null;
  reason: string | null;
  createdAt: unknown;
  actioned: boolean | null;
};
