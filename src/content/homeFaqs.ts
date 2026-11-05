export const HOME_FAQS: { question: string; answer: string }[] = [
  {
    question: "What is an AI data analyzer?",
    answer:
      "An AI data analyzer lets you ask questions about your data in plain English instead of writing formulas or SQL. Quarry reads your files or database, runs the actual calculations with deterministic tools, and answers with charts, reports and citations back to the source.",
  },
  {
    question: "Which file types and databases does Quarry support?",
    answer:
      "You can upload CSV files, Excel workbooks (.xlsx), PDFs and plain text (.txt) files, and connect PostgreSQL and MongoDB (including MongoDB Atlas) databases with read-only credentials.",
  },
  {
    question: "How is this different from asking a general chatbot about my data?",
    answer:
      "Numbers are computed by running code over your full dataset, document answers are grounded in retrieved passages, and every answer cites the file, row or page it came from. You can watch the investigation live instead of trusting an unexplained reply.",
  },
  {
    question: "Can Quarry create charts, reports and dashboards?",
    answer:
      "Yes. Ask for a chart and it is generated from the computed data. You can also export results as CSV, get a written report, or build live dashboards on PostgreSQL and MongoDB that refresh every time they are opened.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Each workspace is private to you. Database connection strings are encrypted at rest and never shown in the browser or written to logs, queries run read-only with timeouts and row limits, and database results are fetched live rather than stored.",
  },
  {
    question: "Is Quarry free?",
    answer: "Yes, it is free to start. Create a workspace, upload a file or connect a database, and ask your first question.",
  },
];
