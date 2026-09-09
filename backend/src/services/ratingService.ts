import prisma from "../utils/prisma";
import { ValidationError, NotFoundError, ForbiddenError, ConflictError } from "../utils/errors";
import { logActivity } from "./xcrService";

export async function upsertRating(
  researchId: string,
  userId: string,
  score: number,
  comment?: string
) {
  if (score < 1 || score > 5) {
    throw new ValidationError("Score must be between 1 and 5.");
  }

  const research = await prisma.research.findUnique({ where: { id: researchId } });
  if (!research) throw new NotFoundError("Research not found.");

  const existing = await prisma.researchRating.findUnique({
    where: { researchId_userId: { researchId, userId } },
  });

  let rating;
  if (existing) {
    rating = await prisma.researchRating.update({
      where: { researchId_userId: { researchId, userId } },
      data: { score, comment },
    });
    await logActivity(userId, "RESEARCH_RATED", "RESEARCH", researchId, { score, updated: true });
  } else {
    rating = await prisma.researchRating.create({
      data: { researchId, userId, score, comment },
    });
    await logActivity(userId, "RESEARCH_RATED", "RESEARCH", researchId, { score });
  }

  // Return updated aggregates
  const allRatings = await prisma.researchRating.findMany({
    where: { researchId },
    select: { score: true },
  });
  const avg = allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;

  return {
    rating,
    avgRating: parseFloat(avg.toFixed(1)),
    totalRatings: allRatings.length,
  };
}

export async function getResearchRatings(researchId: string) {
  const research = await prisma.research.findUnique({ where: { id: researchId } });
  if (!research) throw new NotFoundError("Research not found.");

  const ratings = await prisma.researchRating.findMany({
    where: { researchId },
    include: {
      user: { select: { id: true, name: true, username: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const ratingCount = ratings.length;
  const avgRating =
    ratingCount > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratingCount
      : null;

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach((r) => {
    distribution[r.score] = (distribution[r.score] || 0) + 1;
  });

  return {
    ratings,
    avgRating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
    totalRatings: ratingCount,
    distribution,
  };
}

export async function updateRating(
  researchId: string,
  ratingId: string,
  userId: string,
  score: number,
  comment?: string
) {
  if (score < 1 || score > 5) {
    throw new ValidationError("Score must be between 1 and 5.");
  }

  const rating = await prisma.researchRating.findUnique({ where: { id: ratingId } });
  if (!rating) throw new NotFoundError("Rating not found.");
  if (rating.researchId !== researchId) throw new NotFoundError("Rating not found for this research.");
  if (rating.userId !== userId) throw new ForbiddenError("You can only edit your own ratings.");

  return prisma.researchRating.update({
    where: { id: ratingId },
    data: { score, comment },
  });
}
