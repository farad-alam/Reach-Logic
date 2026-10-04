// src/lib/thread-access.ts
// Shared "can this user access this thread?" check used by the messaging APIs.
import { prisma } from "@/lib/db";

export async function canAccessThread(
  userId: string,
  role: string | undefined,
  threadId: string
): Promise<boolean> {
  if (role === "SUPER_ADMIN") return true;

  if (role === "CLIENT") {
    const thread = await prisma.thread.findUnique({ where: { id: threadId } });
    return thread?.clientId === userId;
  }

  if (role === "TEAM_MEMBER" || role === "CLIENT_COLLEAGUE") {
    const membership = await prisma.threadMember.findUnique({
      where: { threadId_userId: { threadId, userId } },
    });
    return !!membership;
  }

  return false;
}
