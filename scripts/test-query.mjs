import { createRequire } from 'module';
import { readFileSync } from 'fs';

// Load .env.local manually
const envContent = readFileSync('.env.local', 'utf8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx < 0) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim();
  process.env[key] = val;
}

const { PrismaClient } = await import('@prisma/client');
const { PrismaNeonHttp } = await import('@prisma/adapter-neon');

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL, {});
const prisma = new PrismaClient({ adapter });

try {
  const result = await prisma.user.findUnique({
    where: { id: 'cmu2b5pxy000004jnm4t9450i' },
    include: {
      clientOrders: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, serviceTitle: true, status: true, amount: true, createdAt: true },
      },
      clientInvoices: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { lineItems: { select: { amount: true } } },
      },
      clientThread: { select: { id: true } },
    },
  });
  console.log('SUCCESS - user:', result ? `${result.email} (role: ${result.role})` : 'NOT FOUND');
  if (result) {
    console.log('orders:', result.clientOrders.length);
    console.log('invoices:', result.clientInvoices.length);
    console.log('thread:', result.clientThread);
  }
} catch (err) {
  console.error('QUERY ERROR:', err.message);
  console.error(err.stack);
} finally {
  await prisma.$disconnect();
}
