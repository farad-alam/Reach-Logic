const { Pool } = require("@neondatabase/serverless");

try {
  const url = "postgresql://neondb_owner:npg_VD1PpyMJS6nL@ep-mute-frog-axg4glel-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  const pool = new Pool({ connectionString: url });
  console.log("Pool created successfully with postgresql://");
} catch (e) {
  console.log("Failed with postgresql://", e.message);
}

try {
  const url = "postgres://neondb_owner:npg_VD1PpyMJS6nL@ep-mute-frog-axg4glel-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  const pool = new Pool({ connectionString: url });
  console.log("Pool created successfully with postgres://");
} catch (e) {
  console.log("Failed with postgres://", e.message);
}
