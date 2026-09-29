import {
  aggregations,
  breakout,
  defineQuery,
} from "@metabase/embedding-sdk-react/data-app";
import schema from "../src/metabase.data";

const reports = schema.tables.report;
const questions = schema.tables.question;

// Report counts per question. `actioned` is a breakout so the status tab can
// filter on it at runtime. The app looks up each question's category with
// `QuestionCategories` and totals the counts per category: data-app queries
// can't join `report` to `question`.
export const ReportCountsByQuestion = defineQuery({
    source: reports,
    aggregations: [aggregations.count()],
    breakouts: [
        breakout(reports.fields.questionId),
        breakout(reports.fields.actioned),
    ],
    savedQuestionSourceId: 627
});

// Question categories, keyed by the `_id` that reports reference. The app
// filters this to the reported questions at runtime.
export const QuestionCategories = defineQuery({
    source: questions,
    fields: [questions.fields.id2062083, questions.fields.category],
    savedQuestionSourceId: 628
});
