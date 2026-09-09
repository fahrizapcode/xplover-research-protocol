/**
 * reset-data.ts
 * Wipes all content/research/XCR data while keeping user accounts & roles intact.
 * Run with: npx ts-node scripts/reset-data.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄  Starting data reset...\n");

  // 1. Delete in dependency order (children first)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deleted: { [key: string]: number } = {};

  const bd = await prisma.blockchainAttestation.deleteMany();
  deleted["BlockchainAttestation"] = bd.count;

  const al = await prisma.activityLog.deleteMany();
  deleted["ActivityLog"] = al.count;

  const xt = await prisma.xcrTransaction.deleteMany();
  deleted["XcrTransaction"] = xt.count;

  // VisualDesign has cascade from Content, but delete explicitly first
  const vd = await prisma.visualDesign.deleteMany();
  deleted["VisualDesign"] = vd.count;

  // ContentRevision, ContentReview, ContentSlide all cascade from Content
  const cr = await prisma.contentRevision.deleteMany();
  deleted["ContentRevision"] = cr.count;

  const crev = await prisma.contentReview.deleteMany();
  deleted["ContentReview"] = crev.count;

  const cs = await prisma.contentSlide.deleteMany();
  deleted["ContentSlide"] = cs.count;

  const ct = await prisma.content.deleteMany();
  deleted["Content"] = ct.count;

  // ResearchRating cascades from Research
  const rr = await prisma.researchRating.deleteMany();
  deleted["ResearchRating"] = rr.count;

  const rs = await prisma.research.deleteMany();
  deleted["Research"] = rs.count;

  // 2. Reset all user XCR balances to 0
  const { count: usersUpdated } = await prisma.user.updateMany({
    data: { xcrBalance: 0 },
  });

  // 3. Print summary
  console.log("✅  Deleted records:");
  for (const [model, count] of Object.entries(deleted)) {
    console.log(`   ${model.padEnd(24)} → ${count} row(s)`);
  }
  console.log(`\n💰  Reset xcrBalance to 0 for ${usersUpdated} user(s)`);
  console.log("\n🎉  Reset complete. User accounts & roles preserved.\n");
}

main()
  .catch((err) => {
    console.error("❌  Reset failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
