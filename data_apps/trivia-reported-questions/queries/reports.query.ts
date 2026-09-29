import {
  aggregations,
  breakout,
  defineQuery,
} from "@metabase/embedding-sdk-react/data-app";
import schema from "../src/metabase.data";

const reports = schema.tables.report;

// Every report. The UI filters on `actioned`, sorts, and limits at runtime.
export const ReportList = defineQuery({
    source: reports,
    fields: [
        reports.fields.id,
        reports.fields.questionId,
        reports.fields.reason,
        reports.fields.createdAt,
        reports.fields.actioned,
    ],
    savedQuestionSourceId: 622
});

// Report totals split by whether they have been actioned, for the tab counts.
export const ReportCountByStatus = defineQuery({
    source: reports,
    aggregations: [aggregations.count()],
    breakouts: [breakout(reports.fields.actioned)],
    savedQuestionSourceId: 623
});
