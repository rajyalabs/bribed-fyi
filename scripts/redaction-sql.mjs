// Emits SQL to (re)load the name / place lookup tables from data/*.json.
// Usage: node scripts/redaction-sql.mjs > .wrangler/redaction.sql && wrangler d1 execute bribed-fyi-db --remote --file .wrangler/redaction.sql
import { readFileSync } from "node:fs";
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const emit = (table, col, rows) => {
  for (let i = 0; i < rows.length; i += 500) {
    console.log(`INSERT OR IGNORE INTO ${table} (${col}) VALUES ${rows.slice(i, i + 500).map((r) => `(${q(r)})`).join(",")};`);
  }
};
emit("redact_names", "tok", JSON.parse(readFileSync(new URL("../data/redact-names.json", import.meta.url), "utf8")));
emit("redact_places", "phrase", JSON.parse(readFileSync(new URL("../data/redact-places.json", import.meta.url), "utf8")));
