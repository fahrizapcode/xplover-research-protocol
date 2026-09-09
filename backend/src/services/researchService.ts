import prisma from "../utils/prisma";
import { TechnologyCategory } from "@prisma/client";
import { NotFoundError, ForbiddenError } from "../utils/errors";
import { awardXCR, logActivity } from "./xcrService";
import { scheduleBlockchainAttestation } from "../blockchain/attestationService";

export async function createResearch(
  authorId: string,
  data: {
    title: string;
    paperUrl: string;
    publicationYear: number;
    technologyCategory: TechnologyCategory;
    problem: string;
    approach: string;
    keyFindings: string;
    researcherInsight: string;
    whyItMatters: string;
    whatCommunityShouldLearn: string;
    unclearParts?: string;
    discussionQuestions?: string;
  }
) {
  // Get author's wallet address for blockchain
  const author = await prisma.user.findUnique({
    where: { id: authorId },
    select: { walletAddress: true },
  });

  // Create research
  const research = await prisma.research.create({
    data: { ...data, authorId },
    include: {
      author: {
        select: { id: true, name: true, username: true, avatar: true },
      },
    },
  });

  // Award +10 XCR (idempotent — referenceId = research.id)
  await awardXCR(
    authorId,
    10,
    "RESEARCH_SUBMITTED",
    "RESEARCH",
    research.id
  );

  // Log activity
  await logActivity(authorId, "RESEARCH_SUBMITTED", "RESEARCH", research.id, {
    title: research.title,
  });

  // Schedule blockchain attestation (async, non-blocking)
  scheduleBlockchainAttestation(
    "RESEARCH",
    research.id,
    authorId,
    author?.walletAddress ?? null,
    "RESEARCH_SUBMITTED",
    10
  );

  return research;
}

export async function listResearch(params: {
  search?: string;
  technologyCategory?: TechnologyCategory;
  publicationYear?: number;
  sortBy?: "latest" | "highest_rated" | "most_rated";
  page?: number;
  limit?: number;
}) {
  const {
    search,
    technologyCategory,
    publicationYear,
    sortBy = "latest",
    page = 1,
    limit = 12,
  } = params;

  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { problem: { contains: search, mode: "insensitive" } },
      { keyFindings: { contains: search, mode: "insensitive" } },
    ];
  }
  if (technologyCategory) {
    where.technologyCategory = technologyCategory;
  }
  if (publicationYear) {
    where.publicationYear = publicationYear;
  }

  const skip = (page - 1) * limit;

  const [total, research] = await Promise.all([
    prisma.research.count({ where }),
    prisma.research.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, username: true, avatar: true } },
        ratings: { select: { score: true } },
        _count: { select: { content: true } },
      },
      skip,
      take: limit,
      orderBy:
        sortBy === "latest"
          ? { createdAt: "desc" }
          : { createdAt: "desc" }, // For rating sorts, we'll sort in-memory
    }),
  ]);

  const enriched = research.map((r) => {
    const ratingCount = r.ratings.length;
    const avgRating =
      ratingCount > 0
        ? r.ratings.reduce((sum, rt) => sum + rt.score, 0) / ratingCount
        : null;

    return {
      id: r.id,
      title: r.title,
      paperUrl: r.paperUrl,
      publicationYear: r.publicationYear,
      technologyCategory: r.technologyCategory,
      problem: r.problem,
      approach: r.approach,
      keyFindings: r.keyFindings,
      researcherInsight: r.researcherInsight,
      whyItMatters: r.whyItMatters,
      whatCommunityShouldLearn: r.whatCommunityShouldLearn,
      unclearParts: r.unclearParts,
      discussionQuestions: r.discussionQuestions,
      author: r.author,
      avgRating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
      ratingCount,
      contentCount: r._count.content,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  });

  // Apply in-memory sort for rating-based sorts
  if (sortBy === "highest_rated") {
    enriched.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
  } else if (sortBy === "most_rated") {
    enriched.sort((a, b) => b.ratingCount - a.ratingCount);
  }

  return {
    data: enriched,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getResearchById(id: string) {
  const research = await prisma.research.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, username: true, avatar: true } },
      ratings: {
        include: {
          user: { select: { id: true, name: true, username: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!research) throw new NotFoundError("Research not found.");

  const ratingCount = research.ratings.length;
  const avgRating =
    ratingCount > 0
      ? research.ratings.reduce((sum, r) => sum + r.score, 0) / ratingCount
      : null;

  // Rating distribution
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  research.ratings.forEach((r) => {
    distribution[r.score] = (distribution[r.score] || 0) + 1;
  });

  return {
    ...research,
    avgRating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
    ratingCount,
    ratingDistribution: distribution,
  };
}

export async function updateResearch(
  id: string,
  authorId: string,
  data: Partial<{
    title: string;
    paperUrl: string;
    publicationYear: number;
    technologyCategory: TechnologyCategory;
    problem: string;
    approach: string;
    keyFindings: string;
    researcherInsight: string;
    whyItMatters: string;
    whatCommunityShouldLearn: string;
    unclearParts: string;
    discussionQuestions: string;
  }>
) {
  const research = await prisma.research.findUnique({ where: { id } });
  if (!research) throw new NotFoundError("Research not found.");
  if (research.authorId !== authorId)
    throw new ForbiddenError("You can only edit your own research.");

  return prisma.research.update({ where: { id }, data });
}
