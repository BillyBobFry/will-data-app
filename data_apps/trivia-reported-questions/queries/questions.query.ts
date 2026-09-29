import { defineQuery } from "@metabase/embedding-sdk-react/data-app";
import schema from "../src/metabase.data";

// The reported question's details. Reports reference a question by its Mongo
// `_id`, so the selected report's `questionId` filters on that at runtime.
//
// No `fields` clause: `question`, `correctAnswer` and `incorrectAnswers` share
// their names with the nested `i18n.<lang>.*` fields, and Metabase can't tell
// them apart when resolving a field list by name ("Multiple columns found").
// Selecting every column sidesteps that; the top-level fields keep their plain
// result names.
export const QuestionDetail = defineQuery({
    source: schema.tables.question,
    savedQuestionSourceId: 621
});
