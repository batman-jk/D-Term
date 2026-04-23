import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

const createDatabase = (connectionString: string) => {
  const sql = postgres(connectionString, { prepare: false });
  const database = drizzle(sql, { schema });

  return { sql, database };
};

type DatabaseBundle = ReturnType<typeof createDatabase>;
type Database = DatabaseBundle["database"];
type DatabaseClient = DatabaseBundle["sql"];

let client: DatabaseClient | null = null;
let db: Database | null = null;

if (databaseUrl) {
  const bundle = createDatabase(databaseUrl);
  client = bundle.sql;
  db = bundle.database;
}

export { client };

export function hasDatabaseConfig(): boolean {
  return Boolean(databaseUrl);
}

export function getDb(): Database {
  if (!db) {
    throw new Error(
      "DATABASE_URL must be set. Add a valid database connection string before using the API.",
    );
  }

  return db;
}

export * from "./schema";
