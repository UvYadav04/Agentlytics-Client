import type { DatabaseType, RememberOption } from "@/lib/types";

export type GuideStep = {
  title: string;
  body: string;
  code?: string;
};

export type DatabaseGuide = {
  type: DatabaseType;
  label: string;
  tagline: string;
  link: { href: string; label: string };
  example: string;
  placeholder: string;
  steps: GuideStep[];
};

export const DATABASE_GUIDES: Record<DatabaseType, DatabaseGuide> = {
  mongodb: {
    type: "mongodb",
    label: "MongoDB",
    tagline: "MongoDB Atlas or any MongoDB server",
    link: { href: "https://www.mongodb.com/atlas", label: "Open MongoDB Atlas" },
    example: "mongodb+srv://<username>:<password>@<cluster>/<database>",
    placeholder: "mongodb+srv://reader:••••••••@cluster0.abcde.mongodb.net/sales",
    steps: [
      {
        title: "Open your cluster",
        body: "Sign in to MongoDB Atlas, then create or select the cluster that holds the data you want to analyze.",
      },
      {
        title: "Create a read-only database user",
        body: "Go to Security → Database Access → Add New Database User. Choose password authentication and give it the built-in role \"Only read any database\" (or a custom role with read access to just the database you need).",
      },
      {
        title: "Allow network access",
        body: "Under Security → Network Access, add the IP address of the DataAnalyzer server so it can reach your cluster.",
      },
      {
        title: "Copy the connection string",
        body: "Go to Database → Connect → Drivers, pick Python, and copy the connection string shown there.",
      },
      {
        title: "Fill in your details",
        body: "Replace <username> and <password> with the read-only user, and add the database name after the cluster address.",
      },
    ],
  },
  postgresql: {
    type: "postgresql",
    label: "PostgreSQL",
    tagline: "Supabase, Neon, RDS, Render, Railway or self-hosted",
    link: {
      href: "https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING",
      label: "PostgreSQL connection string docs",
    },
    example: "postgresql://<username>:<password>@<host>:5432/<database>",
    placeholder: "postgresql://analyzer_readonly:••••••••@db.example.com:5432/sales",
    steps: [
      {
        title: "Connect as an admin",
        body: "Open psql, pgAdmin, or your provider's SQL editor while signed in as a user that can create roles.",
      },
      {
        title: "Create a read-only user",
        body: "Run the following, replacing the password and database name. Repeat the GRANT lines for any other schema you want to analyze.",
        code: [
          "CREATE ROLE analyzer_readonly LOGIN PASSWORD 'choose-a-strong-password';",
          "GRANT CONNECT ON DATABASE your_database TO analyzer_readonly;",
          "GRANT USAGE ON SCHEMA public TO analyzer_readonly;",
          "GRANT SELECT ON ALL TABLES IN SCHEMA public TO analyzer_readonly;",
          "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO analyzer_readonly;",
        ].join("\n"),
      },
      {
        title: "Find your connection string",
        body: "Supabase: Project Settings → Database → Connection string (URI). Neon: Dashboard → Connection Details. Render/Railway: the database's External Database URL. AWS RDS: build it from the endpoint and port under Connectivity & security.",
      },
      {
        title: "Fill in your details",
        body: "Put the read-only user and password into the string, and make sure your provider allows connections from the DataAnalyzer server's IP address.",
      },
    ],
  },
};

export const REMEMBER_OPTIONS: { value: RememberOption; label: string; hint: string }[] = [
  { value: "always", label: "Always", hint: "Credentials are kept until you remove this connection." },
  { value: "30d", label: "30 days", hint: "Credentials are deleted automatically after 30 days." },
  { value: "7d", label: "7 days", hint: "Credentials are deleted automatically after 7 days." },
  { value: "never", label: "Never", hint: "Only for this session - credentials are deleted after 12 hours." },
];

export function describeExpiry(expiresAt: string | null, status: string): string {
  if (status === "expired") return "Credentials expired";
  if (!expiresAt) return "Remembered";
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Credentials expired";
  const hours = Math.round(ms / 3_600_000);
  if (hours < 24) return `Expires in ${Math.max(hours, 1)}h`;
  return `Expires in ${Math.round(hours / 24)}d`;
}
