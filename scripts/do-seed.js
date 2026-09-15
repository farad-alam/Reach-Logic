require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { Pool, neonConfig } = require("@neondatabase/serverless");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { neon } = require("@neondatabase/serverless");
const { PrismaNeonHttp } = require("@prisma/adapter-neon");

async function main() {
  console.log("Connecting to:", process.env.DATABASE_URL);
  
  const adapter = new PrismaNeonHttp(process.env.DATABASE_URL);
  const prisma = new PrismaClient({ adapter });

  const email = "admin@reachlogic.net";
  const existing = await prisma.user.findUnique({ where: { email } });
  
  if (existing) {
    console.log("Super Admin already exists!");
    return;
  }
  
  const passwordHash = await bcrypt.hash("Admin123!", 12);
  
  await prisma.user.create({
    data: {
      email,
      fullName: "Super Admin",
      role: "SUPER_ADMIN",
      passwordHash,
      isActive: true,
    }
  });
  
  console.log("✅ Super Admin created successfully!");
}

main().catch(console.error).finally(() => process.exit(0));
