export type SolutionIcon = "csv" | "excel" | "pdf" | "text" | "postgresql" | "mongodb" | "dashboard";

export type SolutionTone = "teal" | "accent" | "plum" | "gold" | "clay" | "rust";

export type Solution = {
  slug: string;
  label: string;
  shortDescription: string;
  icon: SolutionIcon;
  tone: SolutionTone;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  eyebrow: string;
  heading: string;
  headingAccent: string;
  intro: string;
  sampleFile: string;
  sampleQuestion: string;
  sampleAnswer: string;
  sampleSource: string;
  highlights: { title: string; body: string }[];
  steps: { title: string; body: string }[];
  questions: string[];
  useCases: { title: string; body: string }[];
  faqs: { question: string; answer: string }[];
  related: string[];
};

export const SOLUTIONS_UPDATED_AT = "2026-10-01";

export const SOLUTIONS: Solution[] = [
  {
    slug: "ai-csv-analyzer",
    label: "AI CSV Analyzer",
    shortDescription: "Ask questions about any CSV and get computed answers, charts and clean exports.",
    icon: "csv",
    tone: "teal",
    metaTitle: "AI CSV Analyzer - Chat with CSV Files in Plain English",
    metaDescription:
      "Chat with CSV files in plain English. Quarry computes totals, trends and outliers with real code, builds charts and exports clean CSVs.",
    keywords: [
      "AI CSV analyzer",
      "chat with CSV",
      "analyze CSV with AI",
      "CSV data analysis tool",
      "ask questions about CSV",
      "CSV to chart",
      "AI data analyzer",
    ],
    eyebrow: "CSV analysis",
    heading: "Chat with your CSV files.",
    headingAccent: "Get computed answers, not guesses.",
    intro:
      "Quarry is an AI CSV analyzer that reads your export, understands the columns, and answers questions by running real computations over every row. Ask for totals, trends, anomalies or a chart in plain English - and see exactly which rows the answer came from.",
    sampleFile: "orders-2026.csv",
    sampleQuestion: "Which product category grew fastest month over month?",
    sampleAnswer: "Home & Garden grew fastest, up 18.4% from August to September, driven by 312 more orders.",
    sampleSource: "orders-2026.csv - 4,812 rows aggregated",
    highlights: [
      {
        title: "Real computations on every row",
        body: "Filters, group-bys, pivots and statistics run as actual code against your full dataset, so totals and averages are exact - never estimated from a sample.",
      },
      {
        title: "Understands messy exports",
        body: "Column names, data types and row counts are profiled when the file is uploaded, so you can ask about ‘revenue’ or ‘signup date’ without cleaning the file first.",
      },
      {
        title: "Charts from one sentence",
        body: "Ask for a bar, line, pie, histogram, box plot, heatmap or timeline and the chart is generated and saved to your workspace with the analysis behind it.",
      },
      {
        title: "Join multiple CSVs",
        body: "Upload several CSVs and ask a question that spans them - the analysis agent finds the matching columns and joins the files for you.",
      },
      {
        title: "Export the result",
        body: "Turn any filtered, aggregated or cleaned result into a downloadable CSV, or ask for a written report that summarizes the findings.",
      },
      {
        title: "Traceable answers",
        body: "Every answer names the file it used and the analysis that produced it, so you can verify a number instead of trusting it.",
      },
    ],
    steps: [
      { title: "Upload your CSV", body: "Drag a CSV into a private workspace. It is profiled and stored as a fast columnar table in seconds." },
      { title: "Ask in plain English", body: "‘Top 10 customers by lifetime value’, ‘Which week had the most refunds?’ - no formulas or SQL needed." },
      { title: "Get the answer and a chart", body: "Read the computed answer, inspect the chart, and export the result as a CSV or report." },
    ],
    questions: [
      "What were total sales by region last quarter?",
      "Show monthly revenue as a line chart",
      "Which customers haven't ordered in 90 days?",
      "Find outliers in the order amount column",
      "What's the average delivery time per carrier?",
      "Export the top 100 products by margin as a CSV",
    ],
    useCases: [
      { title: "Sales & revenue", body: "Break down revenue by region, product or rep and spot the segment that is slipping." },
      { title: "Marketing exports", body: "Analyze campaign, ad and email exports to compare channels and conversion rates." },
      { title: "Operations logs", body: "Summarize shipments, tickets or inventory movements and surface unusual spikes." },
      { title: "Survey results", body: "Count responses, cross-tabulate answers and chart sentiment without a spreadsheet." },
    ],
    faqs: [
      {
        question: "How does the AI CSV analyzer calculate answers?",
        answer:
          "It writes and runs real analysis code over your full CSV in an isolated sandbox, then explains the result. Numbers come from computation over every row, not from the language model guessing.",
      },
      {
        question: "Can I analyze more than one CSV at a time?",
        answer:
          "Yes. Upload several CSV files to the same workspace and ask a question that spans them - the analysis agent can join and compare files in a single investigation.",
      },
      {
        question: "Can it make charts from my CSV?",
        answer:
          "Yes. Ask for a bar, line, pie, histogram, box plot, heatmap, timeline, 3D scatter or surface chart and it is generated and saved to your workspace.",
      },
      {
        question: "Can I download the results?",
        answer: "Yes. Any computed result can be exported as a new CSV file, and findings can be written up as a downloadable report.",
      },
      {
        question: "Is my CSV data private?",
        answer:
          "Files live in a private workspace that only you can access, and each analysis runs in an isolated sandbox scoped to the files you assign to it.",
      },
    ],
    related: ["ai-excel-analyzer", "ai-dashboard-generator", "postgresql-ai-analyzer"],
  },
  {
    slug: "ai-excel-analyzer",
    label: "AI Excel Analyzer",
    shortDescription: "Analyze multi-sheet Excel workbooks with plain-English questions.",
    icon: "excel",
    tone: "accent",
    metaTitle: "AI Excel Analyzer - Analyze Excel Spreadsheets with AI",
    metaDescription:
      "Ask questions across every sheet of an Excel workbook. Quarry runs exact calculations, builds charts and reports, and cites the source sheet.",
    keywords: [
      "AI Excel analyzer",
      "analyze Excel with AI",
      "chat with Excel",
      "Excel AI assistant",
      "xlsx data analysis",
      "AI spreadsheet analysis",
      "AI data analyzer",
    ],
    eyebrow: "Excel analysis",
    heading: "Analyze Excel spreadsheets with AI.",
    headingAccent: "Every sheet, every row, no formulas.",
    intro:
      "Quarry reads every sheet in your .xlsx workbook as its own table, so you can ask questions across tabs in plain English. The answers are calculated with real code over the full data and come back with charts, exports and a clear trail to the sheet they came from.",
    sampleFile: "regional-sales-q3.xlsx",
    sampleQuestion: "Which region missed its target by the most?",
    sampleAnswer: "West missed by 26%, closing at $412K against a $560K target. East and Central beat target.",
    sampleSource: "Sheet ‘Targets’ joined with sheet ‘Actuals’",
    highlights: [
      {
        title: "Multi-sheet workbooks",
        body: "Each worksheet becomes its own queryable table, so a question can compare or join data that lives on different tabs.",
      },
      {
        title: "No formulas or pivot tables",
        body: "Ask for the pivot, VLOOKUP-style match or running total you need in a sentence - the calculation is done for you.",
      },
      {
        title: "Exact, reproducible numbers",
        body: "Calculations run as code over the whole sheet, not over a pasted sample, so the result matches what Excel would compute.",
      },
      {
        title: "Charts and reports",
        body: "Turn a breakdown into a chart in one step, or ask for a written report you can share with your team.",
      },
      {
        title: "Replace with a new version",
        body: "Upload next month's workbook over the old one - your charts and dashboards keep pointing at the same file and refresh automatically.",
      },
      {
        title: "Clean exports",
        body: "Export any filtered or aggregated result to CSV for use in another tool or to send to a colleague.",
      },
    ],
    steps: [
      { title: "Upload your workbook", body: "Drop in an .xlsx file. Every sheet is detected and stored as a separate table." },
      { title: "Ask across sheets", body: "‘Compare budget vs actual by department’ - the agent finds the right sheets and joins them." },
      { title: "Share the result", body: "Keep the chart in your workspace, export a CSV, or generate a written report." },
    ],
    questions: [
      "Compare budget vs actual spend by department",
      "Which sheet has the highest total revenue?",
      "Show headcount by team as a pie chart",
      "List invoices that are more than 30 days overdue",
      "What is the month-over-month growth for each product?",
      "Summarize this workbook in a short report",
    ],
    useCases: [
      { title: "Finance & budgeting", body: "Reconcile budget and actuals, track spend by cost center and flag variances." },
      { title: "Sales trackers", body: "Rank reps, regions and products and see who is ahead of target." },
      { title: "HR & headcount", body: "Summarize headcount, attrition and hiring plans across teams." },
      { title: "Inventory sheets", body: "Find low-stock items, slow movers and reorder candidates." },
    ],
    faqs: [
      {
        question: "Does the AI Excel analyzer read all sheets in a workbook?",
        answer: "Yes. Every sheet in an .xlsx workbook is extracted as its own table, and questions can use one sheet or combine several.",
      },
      {
        question: "Which Excel formats are supported?",
        answer: "Excel workbooks in .xlsx format are supported. Older .xls files can be saved as .xlsx or exported to CSV first.",
      },
      {
        question: "Do I need to know Excel formulas?",
        answer: "No. Describe what you want - a pivot, a lookup, a growth rate - and the analysis is calculated for you over the full data.",
      },
      {
        question: "What happens when I upload an updated workbook?",
        answer:
          "Use Replace file on the existing workbook. It keeps the same file in your workspace, so charts and dashboards built on it refresh with the new data.",
      },
      {
        question: "Can I get a chart or report from my spreadsheet?",
        answer: "Yes. Ask for a chart and it is generated from the computed data, or ask for a report that writes up the findings for you.",
      },
    ],
    related: ["ai-csv-analyzer", "ai-dashboard-generator", "ai-pdf-analyzer"],
  },
  {
    slug: "ai-pdf-analyzer",
    label: "AI PDF Analyzer",
    shortDescription: "Chat with PDFs and get answers cited to the exact page.",
    icon: "pdf",
    tone: "plum",
    metaTitle: "AI PDF Analyzer - Chat with PDFs and Get Cited Answers",
    metaDescription:
      "Chat with PDFs - contracts, reports, research papers. Get answers cited to the exact page, full-document summaries and analysis of tables inside PDFs.",
    keywords: [
      "AI PDF analyzer",
      "chat with PDF",
      "ask questions to PDF",
      "PDF summarizer AI",
      "analyze PDF with AI",
      "extract tables from PDF",
      "AI document analysis",
    ],
    eyebrow: "PDF analysis",
    heading: "Chat with your PDFs.",
    headingAccent: "Answers cited to the exact page.",
    intro:
      "Quarry is an AI PDF analyzer for long documents. It parses and indexes every page, so a question finds the paragraph that answers it - with a page citation you can check. Ask for a specific clause, summarize the whole document, or pull out the tables inside it and analyze them like a spreadsheet.",
    sampleFile: "vendor-agreement.pdf",
    sampleQuestion: "What is the termination notice period?",
    sampleAnswer: "Either party may terminate the agreement with 60 days written notice (Section 8.2).",
    sampleSource: "vendor-agreement.pdf - page 12",
    highlights: [
      {
        title: "Page-level citations",
        body: "Answers point to the page and passage they came from, so you can verify a clause or figure in seconds.",
      },
      {
        title: "Finds the paragraph, not just the file",
        body: "Semantic search with re-ranking surfaces the most relevant passages across one document or many.",
      },
      {
        title: "Whole-document summaries",
        body: "Summaries, key takeaways, risks and action items are built by reading the entire document in order, not a handful of snippets.",
      },
      {
        title: "Tables inside PDFs",
        body: "Tables found in a PDF are extracted into structured data, so you can total, filter and chart them like a spreadsheet.",
      },
      {
        title: "Compare documents",
        body: "Ask how two contracts or reports differ and get a side-by-side answer grounded in both files.",
      },
      {
        title: "Checks its own claims",
        body: "The document agent can verify that a cited passage actually supports a claim before it appears in your answer.",
      },
    ],
    steps: [
      { title: "Upload your PDF", body: "Add contracts, reports or papers up to 25 MB each. Pages are parsed, chunked and indexed." },
      { title: "Ask a question or request a summary", body: "‘What are the payment terms?’ or ‘Give me an executive summary’." },
      { title: "Check the citation", body: "Every answer cites the page it came from, and extracted tables can be analyzed further." },
    ],
    questions: [
      "Summarize this report in five bullet points",
      "What are the payment terms in this contract?",
      "List every deadline mentioned in the document",
      "What risks does the annual report mention?",
      "Compare the liability clauses in these two agreements",
      "Total the amounts in the table on the pricing page",
    ],
    useCases: [
      { title: "Contracts & legal", body: "Find clauses, obligations, renewal dates and termination terms with page citations." },
      { title: "Financial reports", body: "Pull figures from annual reports and filings and analyze the tables inside them." },
      { title: "Research papers", body: "Summarize methods and findings and compare results across papers." },
      { title: "Policies & manuals", body: "Answer questions from handbooks, SOPs and compliance documents instantly." },
    ],
    faqs: [
      {
        question: "How do I chat with a PDF in Quarry?",
        answer:
          "Upload the PDF to a workspace and ask your question in plain English. The document is indexed page by page, and answers cite the page they came from.",
      },
      {
        question: "Can it summarize an entire PDF?",
        answer:
          "Yes. Whole-document requests such as summaries, key takeaways, risks or action items are processed by reading the full document in order, then combined into one answer.",
      },
      {
        question: "Can it analyze tables inside a PDF?",
        answer: "Yes. Tables detected in a PDF are extracted as structured data, so you can calculate totals, filter rows or build charts from them.",
      },
      {
        question: "How large can a PDF be?",
        answer: "PDF and text files can be up to 25 MB each. Long multi-page documents are supported and processed page by page.",
      },
      {
        question: "Can I ask questions across several PDFs?",
        answer: "Yes. Upload multiple documents to the same workspace and ask a question that compares or combines them.",
      },
    ],
    related: ["ai-text-file-analyzer", "ai-excel-analyzer", "ai-csv-analyzer"],
  },
  {
    slug: "ai-text-file-analyzer",
    label: "AI Text File Analyzer",
    shortDescription: "Search, summarize and question TXT files, notes, logs and transcripts.",
    icon: "text",
    tone: "gold",
    metaTitle: "AI Text File Analyzer - Summarize and Question TXT Files",
    metaDescription:
      "Upload TXT notes, transcripts or logs and ask questions in plain English. Quarry searches, summarizes and compares text with cited passages.",
    keywords: [
      "AI text file analyzer",
      "analyze TXT file with AI",
      "text summarizer AI",
      "chat with text file",
      "transcript analysis AI",
      "log file analysis AI",
      "AI document analysis",
    ],
    eyebrow: "Text file analysis",
    heading: "Turn plain text files into answers.",
    headingAccent: "Notes, transcripts and logs, searchable by meaning.",
    intro:
      "Quarry indexes your .txt files so you can ask questions by meaning, not keyword. Summarize long transcripts, pull decisions out of meeting notes, or find every mention of an error in a log export - each answer linked to the passage it came from.",
    sampleFile: "customer-interviews.txt",
    sampleQuestion: "What are the three most common complaints?",
    sampleAnswer: "Slow onboarding, unclear pricing tiers and missing export options came up most often across the interviews.",
    sampleSource: "customer-interviews.txt - 9 cited passages",
    highlights: [
      {
        title: "Search by meaning",
        body: "Semantic search finds the relevant passage even when it doesn't use the words in your question.",
      },
      {
        title: "Full-document summaries",
        body: "Long transcripts and notes are read end to end to produce summaries, themes and action items.",
      },
      {
        title: "Cited passages",
        body: "Answers reference the passages they were drawn from, so you can jump to the original text.",
      },
      {
        title: "Compare files",
        body: "Ask what changed between two versions of a document or how two transcripts differ.",
      },
      {
        title: "Mix with your data",
        body: "Combine text files with CSVs, spreadsheets and PDFs in the same workspace and ask questions across all of them.",
      },
      {
        title: "Reports on demand",
        body: "Turn findings from your text files into a written report you can download and share.",
      },
    ],
    steps: [
      { title: "Upload .txt files", body: "Add notes, transcripts, logs or exported text up to 25 MB each." },
      { title: "Ask or summarize", body: "‘What decisions were made?’ ‘Summarize the key themes.’ ‘Find every error code.’" },
      { title: "Use the findings", body: "Read cited answers and turn them into reports alongside your other data." },
    ],
    questions: [
      "Summarize this meeting transcript",
      "What action items were assigned and to whom?",
      "Find every mention of a timeout error in this log",
      "What themes appear across these interview notes?",
      "What changed between these two policy drafts?",
      "Write a one-page report from these notes",
    ],
    useCases: [
      { title: "Meeting notes", body: "Extract decisions, owners and follow-ups from long notes." },
      { title: "Interviews & research", body: "Find recurring themes across customer or user interview transcripts." },
      { title: "Logs & exports", body: "Search plain-text logs for errors, patterns and unusual events." },
      { title: "Drafts & policies", body: "Compare versions and summarize what changed." },
    ],
    faqs: [
      {
        question: "What kinds of text files can I analyze?",
        answer: "Any plain .txt file - meeting notes, interview transcripts, exported chats, logs or drafts - up to 25 MB per file.",
      },
      {
        question: "Can it summarize a long transcript?",
        answer: "Yes. Whole-document requests read the full text in order and return a summary, themes, key points or action items.",
      },
      {
        question: "Does it only match exact keywords?",
        answer: "No. Text is indexed for semantic search, so it finds passages that match the meaning of your question, then re-ranks them for relevance.",
      },
      {
        question: "Can I combine text files with spreadsheets?",
        answer: "Yes. A workspace can hold text files, PDFs, CSVs and Excel workbooks together, and one question can draw on all of them.",
      },
    ],
    related: ["ai-pdf-analyzer", "ai-csv-analyzer", "ai-dashboard-generator"],
  },
  {
    slug: "postgresql-ai-analyzer",
    label: "PostgreSQL AI Analyzer",
    shortDescription: "Ask your Postgres database questions in plain English with read-only access.",
    icon: "postgresql",
    tone: "clay",
    metaTitle: "PostgreSQL AI Analyzer - Query Postgres in Plain English",
    metaDescription:
      "Ask PostgreSQL questions in plain English. Quarry writes safe read-only SQL and builds live dashboards - without storing your table data.",
    keywords: [
      "PostgreSQL AI analyzer",
      "natural language to SQL",
      "ask Postgres in plain English",
      "AI SQL generator",
      "PostgreSQL dashboard",
      "text to SQL",
      "AI database analysis",
    ],
    eyebrow: "PostgreSQL",
    heading: "Ask your PostgreSQL database anything.",
    headingAccent: "Plain English in, live dashboards out.",
    intro:
      "Connect a PostgreSQL database with a read-only user and Quarry maps its schemas, tables and relationships. Ask a question in plain English and it writes validated, read-only SQL, runs it, and turns the result into live charts and dashboards that fetch fresh data every time they are opened.",
    sampleFile: "analytics (PostgreSQL)",
    sampleQuestion: "Daily signups over the last 30 days, split by plan",
    sampleAnswer: "Signups averaged 142 per day, with the Pro plan growing from 18% to 27% of new accounts.",
    sampleSource: "public.users joined with public.subscriptions",
    highlights: [
      {
        title: "Read-only by design",
        body: "Queries run in a read-only transaction with a timeout and row limit, and statements that could modify data are rejected before they run.",
      },
      {
        title: "Schema-aware SQL",
        body: "Tables, views, columns, primary keys and foreign keys are mapped on connect, so generated SQL uses real names and joins.",
      },
      {
        title: "Live dashboards",
        body: "Dashboards store the query, not your data, and re-run it when opened - with relative time windows like ‘last 30 days’.",
      },
      {
        title: "Encrypted credentials",
        body: "Connection strings are encrypted at rest, never sent back to the browser and never written to logs.",
      },
      {
        title: "Safety checks on connect",
        body: "Test the connection before saving, and get a warning if the database user can modify any table.",
      },
      {
        title: "Share with your team",
        body: "Share a live dashboard with teammates by email, with an optional expiry date for the link.",
      },
    ],
    steps: [
      { title: "Create a read-only user", body: "Follow the in-app guide to create a Postgres user with SELECT-only access." },
      { title: "Connect and test", body: "Paste the connection string, test it, review the schema, and choose how long to remember it." },
      { title: "Ask and build", body: "Ask a question or request a dashboard - the SQL is generated, validated and run live." },
    ],
    questions: [
      "How many orders were placed each day this month?",
      "Top 10 customers by revenue in the last 90 days",
      "Build a dashboard of signups, churn and MRR",
      "Which products have no sales in the last 60 days?",
      "Average order value by country this quarter",
      "Show weekly active users for the last 12 weeks",
    ],
    useCases: [
      { title: "Product analytics", body: "Track signups, activation and retention straight from your app database." },
      { title: "Revenue reporting", body: "Build MRR, order and payment dashboards that are always current." },
      { title: "Operations", body: "Monitor fulfilment, support tickets and backlogs without writing SQL." },
      { title: "Ad-hoc questions", body: "Let non-engineers get answers without waiting for a data team." },
    ],
    faqs: [
      {
        question: "Is it safe to connect my production PostgreSQL database?",
        answer:
          "Connect with a dedicated read-only user. Queries also run in a read-only transaction with a statement timeout and a row limit, and data-modifying statements are blocked before execution.",
      },
      {
        question: "Does Quarry store my database data?",
        answer:
          "No. Only the generated queries and dashboard settings are saved. Data is fetched live when a dashboard is opened and is not cached on the server.",
      },
      {
        question: "How are my database credentials protected?",
        answer:
          "Connection strings are encrypted at rest, never returned to the browser and never written to application logs. You choose whether they are remembered always, for 7 or 30 days, or not at all.",
      },
      {
        question: "Do I need to know SQL?",
        answer: "No. Ask in plain English. The AI uses your actual schema to write the SQL, validates it, and retries if a query fails.",
      },
      {
        question: "Can I share a dashboard built on PostgreSQL?",
        answer: "Yes. Share it with existing users by email and optionally set an expiry date. Viewers must log in to see it.",
      },
    ],
    related: ["mongodb-ai-analyzer", "ai-dashboard-generator", "ai-csv-analyzer"],
  },
  {
    slug: "mongodb-ai-analyzer",
    label: "MongoDB AI Analyzer",
    shortDescription: "Turn plain-English questions into safe MongoDB aggregations and live charts.",
    icon: "mongodb",
    tone: "teal",
    metaTitle: "MongoDB AI Analyzer - Query MongoDB with Natural Language",
    metaDescription:
      "Query MongoDB or Atlas in plain English. Quarry builds safe aggregation pipelines and live dashboards without storing your documents.",
    keywords: [
      "MongoDB AI analyzer",
      "MongoDB natural language query",
      "AI MongoDB aggregation",
      "MongoDB Atlas dashboard",
      "MongoDB analytics",
      "chat with MongoDB",
      "AI database analysis",
    ],
    eyebrow: "MongoDB",
    heading: "Query MongoDB in plain English.",
    headingAccent: "Aggregations and dashboards without writing pipelines.",
    intro:
      "Connect MongoDB or MongoDB Atlas with a read-only user and Quarry samples your collections to learn their fields. Ask a question in plain English and it builds a validated aggregation pipeline, runs it live, and turns the result into charts and dashboards you can share.",
    sampleFile: "shop (MongoDB Atlas)",
    sampleQuestion: "Orders per day by status for the last 14 days",
    sampleAnswer: "Delivered orders averaged 1,240 per day; cancellations spiked to 6.1% last Tuesday.",
    sampleSource: "orders collection - aggregation pipeline",
    highlights: [
      {
        title: "Safe aggregation pipelines",
        body: "Write stages such as $out and $merge, and server-side JavaScript operators, are blocked, and every query has a row limit and timeout.",
      },
      {
        title: "Learns your collections",
        body: "Fields and types are inferred from sampled documents, including nested fields, so pipelines use the right paths.",
      },
      {
        title: "Works with Atlas",
        body: "Connect a self-hosted MongoDB or an Atlas cluster with a standard or SRV connection string.",
      },
      {
        title: "Live dashboards",
        body: "Dashboards store the pipeline, not your documents, and re-run it on open with relative time windows.",
      },
      {
        title: "Encrypted credentials",
        body: "Connection strings are encrypted, never shown in the browser and never logged.",
      },
      {
        title: "Retries with context",
        body: "If a pipeline fails, the error is fed back so the AI can correct the query before showing you a result.",
      },
    ],
    steps: [
      { title: "Create a read-only user", body: "Use the in-app guide to create a user with the read role on your database." },
      { title: "Connect your cluster", body: "Paste the connection string, test it and review the detected collections." },
      { title: "Ask for answers or dashboards", body: "Ask in plain English and get charts backed by live aggregation pipelines." },
    ],
    questions: [
      "How many new users signed up each week?",
      "Top 5 product categories by order count",
      "Average session length by device type",
      "Build a dashboard of orders, revenue and cancellations",
      "Which customers have more than 3 open tickets?",
      "Revenue by country for the last 30 days",
    ],
    useCases: [
      { title: "App analytics", body: "Analyze users, events and sessions stored as documents." },
      { title: "E-commerce", body: "Track orders, carts, refunds and product performance live." },
      { title: "Support & ops", body: "Monitor tickets, statuses and response times across collections." },
      { title: "IoT & events", body: "Aggregate high-volume event documents into daily trends." },
    ],
    faqs: [
      {
        question: "Does it work with MongoDB Atlas?",
        answer: "Yes. Connect an Atlas cluster or a self-hosted MongoDB using a standard mongodb:// or mongodb+srv:// connection string.",
      },
      {
        question: "Can the AI change or delete my MongoDB data?",
        answer:
          "It is designed not to. Connect with a read-only user, and pipelines that write data or run server-side JavaScript are rejected before they reach your database.",
      },
      {
        question: "Are my documents stored by Quarry?",
        answer: "No. Only the pipeline and chart settings are saved. Results are fetched live when you open a dashboard.",
      },
      {
        question: "Do I need to write aggregation pipelines?",
        answer: "No. Describe what you want to see and the pipeline is generated from your collection's fields, validated, and run for you.",
      },
    ],
    related: ["postgresql-ai-analyzer", "ai-dashboard-generator", "ai-csv-analyzer"],
  },
  {
    slug: "ai-dashboard-generator",
    label: "AI Dashboard Generator",
    shortDescription: "Describe a dashboard and get live charts from your files or database.",
    icon: "dashboard",
    tone: "rust",
    metaTitle: "AI Dashboard Generator - Live Charts from Plain English",
    metaDescription:
      "Describe a dashboard and Quarry builds it from CSV, Excel, PostgreSQL or MongoDB. Live charts refresh on open and can be shared securely.",
    keywords: [
      "AI dashboard generator",
      "AI chart generator",
      "create dashboard with AI",
      "automatic dashboard",
      "live dashboard from database",
      "AI report generator",
      "AI data visualization",
    ],
    eyebrow: "Dashboards & charts",
    heading: "Describe a dashboard.",
    headingAccent: "Get live charts from your data.",
    intro:
      "Tell Quarry what you want to track and it builds the charts for you - from uploaded CSV and Excel files or straight from PostgreSQL and MongoDB. Dashboards keep the query, not a copy of your data, so they show fresh numbers every time they are opened and can be shared with your team.",
    sampleFile: "Revenue overview dashboard",
    sampleQuestion: "Build a dashboard of revenue, orders and top products for the last 30 days",
    sampleAnswer: "Created 4 charts: daily revenue, orders by status, top 10 products and average order value.",
    sampleSource: "Live - refreshed when opened",
    highlights: [
      {
        title: "From a sentence to a dashboard",
        body: "Describe the metrics and the AI picks chart types, writes the queries and lays out the dashboard.",
      },
      {
        title: "Many chart types",
        body: "Bar, stacked bar, line, area, pie, metric tiles and tables for dashboards, plus histograms, box plots, heatmaps and timelines in analysis.",
      },
      {
        title: "Always up to date",
        body: "Live dashboards re-run their queries when opened, and file-based dashboards refresh when you replace the file.",
      },
      {
        title: "Relative time windows",
        body: "‘Last 7 days’ or ‘last 3 months’ stays relative, so the dashboard is still correct next week.",
      },
      {
        title: "Secure sharing",
        body: "Share with existing users by email, require login to view, and set an expiry date for each share.",
      },
      {
        title: "Reports and exports",
        body: "Turn the same findings into a written report or a CSV export when a chart isn't enough.",
      },
    ],
    steps: [
      { title: "Bring your data", body: "Upload CSV or Excel files, or connect PostgreSQL or MongoDB with a read-only user." },
      { title: "Describe what to track", body: "‘Revenue, orders and refunds for the last 30 days, by region.’" },
      { title: "Open, refresh and share", body: "The dashboard is saved to your workspace, refreshes on open and can be shared." },
    ],
    questions: [
      "Build a sales dashboard for the last quarter",
      "Create a KPI dashboard with signups, churn and MRR",
      "Chart monthly expenses by category",
      "Show orders by status as a stacked bar chart",
      "Make a dashboard of support tickets by priority",
      "Turn this analysis into a report",
    ],
    useCases: [
      { title: "Executive KPIs", body: "Keep revenue, growth and retention on one page that is always current." },
      { title: "Team reporting", body: "Replace weekly copy-paste reports with a shared live dashboard." },
      { title: "Client dashboards", body: "Share a time-limited dashboard with stakeholders who have an account." },
      { title: "Quick exploration", body: "Get a chart for a one-off question without opening a BI tool." },
    ],
    faqs: [
      {
        question: "What data sources can the AI dashboard generator use?",
        answer: "Uploaded CSV and Excel files, plus live PostgreSQL and MongoDB databases connected with read-only credentials.",
      },
      {
        question: "Do dashboards update automatically?",
        answer:
          "Yes. Database dashboards re-run their saved queries every time they are opened. File-based dashboards refresh when you replace the underlying file with a new version.",
      },
      {
        question: "Can I share a dashboard?",
        answer: "Yes. Share it with existing users by email. Viewers must log in, and you can set an expiry date for each share.",
      },
      {
        question: "Is my data copied into the dashboard?",
        answer: "No. Database dashboards store only the query and chart settings; results are fetched live and not cached on the server.",
      },
      {
        question: "Can I get a written report too?",
        answer: "Yes. Ask for a report and the findings are written up as a downloadable document alongside your charts.",
      },
    ],
    related: ["postgresql-ai-analyzer", "ai-excel-analyzer", "mongodb-ai-analyzer"],
  },
];

export function getSolution(slug: string): Solution | undefined {
  return SOLUTIONS.find((solution) => solution.slug === slug);
}
