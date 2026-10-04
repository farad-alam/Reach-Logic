// One-off: add nullable edit/delete columns to messages (additive, idempotent).
require("dotenv").config({ path: ".env.local", quiet: true });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

(async () => {
  await sql.query(
    'ALTER TABLE messages ' +
      'ADD COLUMN IF NOT EXISTS "editedAt" TIMESTAMP(3), ' +
      'ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3), ' +
      'ADD COLUMN IF NOT EXISTS "deletedById" TEXT'
  );
  const cols = await sql.query(
    "select column_name, data_type, is_nullable from information_schema.columns where table_name='messages' order by ordinal_position"
  );
  console.log(cols);
  const c = await sql.query('select count(*)::int as total, count("deletedAt")::int as deleted, count("editedAt")::int as edited from messages');
  console.log(c);
})().catch((e) => {
  console.error("ERR", e.message);
  process.exit(1);
});
