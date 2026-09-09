import prisma from "../utils/prisma";
import {
  ContentStatus,
  RoleName,
  XcrTransactionType,
} from "@prisma/client";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
  ConflictError,
} from "../utils/errors";
import { awardXCR, logActivity } from "./xcrService";
import { scheduleBlockchainAttestation } from "../blockchain/attestationService";

const MIN_REVIEWERS = 5;

export async function getPendingReviews(reviewerId: string) {
  // Get content that:
  // 1. Is UNDER_REVIEW
  // 2. Not created by this reviewer
  // 3. Not already reviewed by this reviewer in current round
  const content = await prisma.content.findMany({
    where: { status: ContentStatus.UNDER_REVIEW },
    include: {
      research: { select: { id: true, title: true, technologyCategory: true } },
      creator: { select: { id: true, name: true, username: true } },
      slides: { orderBy: { slideNumber: "asc" } },
      reviews: { select: { reviewerId: true, reviewRound: true } },
      _count: { select: { reviews: true } },
    },
    orderBy: { updatedAt: "asc" },
  });

  return content.filter((c) => {
    // Exclude own content
    if (c.createdBy === reviewerId) return false;

    // Determine current review round based on revisionCount
    const currentRound = (c.revisionCount || 0) + 1;

    // Exclude if already reviewed this round
    const alreadyReviewed = c.reviews.some(
      (r) => r.reviewerId === reviewerId && r.reviewRound === currentRound
    );
    return !alreadyReviewed;
  });
}

export async function submitReview(
  contentId: string,
  reviewerId: string,
  data: {
    accuracyScore: number;
    relevanceScore: number;
    clarityScore: number;
    hookScore: number;
    valueScore: number;
    flowScore: number;
    ctaScore: number;
    consistencyScore: number;
    comment: string;
  }
) {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: {
      research: {
        select: { id: true, authorId: true, author: { select: { walletAddress: true } } },
      },
      reviews: true,
    },
  });

  if (!content) throw new NotFoundError("Content not found.");
  if (content.status !== ContentStatus.UNDER_REVIEW) {
    throw new ValidationError("Content is not currently under review.");
  }
  if (content.createdBy === reviewerId) {
    throw new ForbiddenError("You cannot review your own content.");
  }

  // Determine current round
  const currentRound = content.revisionCount + 1;

  // Check for duplicate review in this round
  const alreadyReviewed = content.reviews.some(
    (r) => r.reviewerId === reviewerId && r.reviewRound === currentRound
  );
  if (alreadyReviewed) {
    throw new ConflictError(
      "You have already submitted a review for this content in this round."
    );
  }

  // Validate all scores are 1-10
  const scores = [
    data.accuracyScore,
    data.relevanceScore,
    data.clarityScore,
    data.hookScore,
    data.valueScore,
    data.flowScore,
    data.ctaScore,
    data.consistencyScore,
  ];
  if (scores.some((s) => s < 1 || s > 10)) {
    throw new ValidationError("All scores must be between 1 and 10.");
  }

  // Create the review
  const review = await prisma.contentReview.create({
    data: {
      contentId,
      reviewerId,
      ...data,
      reviewRound: currentRound,
    },
  });

  // Award +5 XCR to reviewer (idempotent — referenceId = review.id)
  await awardXCR(reviewerId, 5, XcrTransactionType.PEER_REVIEW_COMPLETED, "REVIEW", review.id);

  await logActivity(reviewerId, "PEER_REVIEW_COMPLETED", "CONTENT", contentId, {
    reviewId: review.id,
    round: currentRound,
  });

  // Schedule blockchain attestation for reviewer
  const reviewer = await prisma.user.findUnique({
    where: { id: reviewerId },
    select: { walletAddress: true },
  });
  scheduleBlockchainAttestation(
    "REVIEW",
    review.id,
    reviewerId,
    reviewer?.walletAddress ?? null,
    "PEER_REVIEW_COMPLETED",
    5
  );

  // Check if we have enough reviews to compute result
  await checkAndProcessReviewResult(contentId, currentRound, content.research);

  return review;
}

/**
 * Checks if minimum reviewers met and processes approval/revision/expiration.
 */
async function checkAndProcessReviewResult(
  contentId: string,
  currentRound: number,
  research: { id: string; authorId: string; author: { walletAddress: string | null } }
): Promise<void> {
  const reviews = await prisma.contentReview.findMany({
    where: { contentId, reviewRound: currentRound },
  });

  if (reviews.length < MIN_REVIEWERS) return; // Not enough reviewers yet

  // Calculate overall score (average of all 8 criteria across all reviewers)
  const overall = calculateOverallScore(reviews);

  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content || content.status !== ContentStatus.UNDER_REVIEW) return;

  if (overall >= 8.0) {
    // APPROVED
    await prisma.content.update({
      where: { id: contentId },
      data: { status: ContentStatus.APPROVED },
    });
    await logActivity("system", "CONTENT_APPROVED", "CONTENT", contentId, {
      overall,
      reviewCount: reviews.length,
      round: currentRound,
    });

    // Immediately transition to READY_FOR_VISUAL
    await prisma.content.update({
      where: { id: contentId },
      data: { status: ContentStatus.READY_FOR_VISUAL },
    });

    // Award researcher +20 XCR for research reference (idempotent)
    const { awarded } = await awardXCR(
      research.authorId,
      20,
      XcrTransactionType.RESEARCH_REFERENCED_CONTENT_APPROVED,
      "CONTENT",
      contentId
    );

    if (awarded) {
      await logActivity(research.authorId, "XCR_EARNED", "CONTENT", contentId, {
        amount: 20,
        reason: "RESEARCH_REFERENCED_CONTENT_APPROVED",
      });

      // Schedule blockchain attestation for researcher
      scheduleBlockchainAttestation(
        "CONTENT",
        contentId,
        research.authorId,
        research.author.walletAddress,
        "CONTENT_APPROVED",
        20
      );
    }
  } else if (currentRound === 1) {
    // Round 1 failed — REVISION_REQUIRED
    await prisma.content.update({
      where: { id: contentId },
      data: { status: ContentStatus.REVISION_REQUIRED },
    });
    await logActivity("system", "REVISION_REQUESTED", "CONTENT", contentId, {
      overall,
      reviewCount: reviews.length,
    });
  } else {
    // Round 2 failed — EXPIRED
    await prisma.content.update({
      where: { id: contentId },
      data: { status: ContentStatus.EXPIRED },
    });
    await logActivity("system", "CONTENT_EXPIRED", "CONTENT", contentId, {
      overall,
      reviewCount: reviews.length,
    });
  }
}

export function calculateOverallScore(
  reviews: Array<{
    accuracyScore: number;
    relevanceScore: number;
    clarityScore: number;
    hookScore: number;
    valueScore: number;
    flowScore: number;
    ctaScore: number;
    consistencyScore: number;
  }>
): number {
  if (reviews.length === 0) return 0;

  const totals = reviews.reduce(
    (acc, r) => ({
      accuracy: acc.accuracy + r.accuracyScore,
      relevance: acc.relevance + r.relevanceScore,
      clarity: acc.clarity + r.clarityScore,
      hook: acc.hook + r.hookScore,
      value: acc.value + r.valueScore,
      flow: acc.flow + r.flowScore,
      cta: acc.cta + r.ctaScore,
      consistency: acc.consistency + r.consistencyScore,
    }),
    {
      accuracy: 0,
      relevance: 0,
      clarity: 0,
      hook: 0,
      value: 0,
      flow: 0,
      cta: 0,
      consistency: 0,
    }
  );

  const count = reviews.length;
  const avgAccuracy = totals.accuracy / count;
  const avgRelevance = totals.relevance / count;
  const avgClarity = totals.clarity / count;
  const avgHook = totals.hook / count;
  const avgValue = totals.value / count;
  const avgFlow = totals.flow / count;
  const avgCta = totals.cta / count;
  const avgConsistency = totals.consistency / count;

  // Overall = average of all 8 criteria averages
  const overall =
    (avgAccuracy +
      avgRelevance +
      avgClarity +
      avgHook +
      avgValue +
      avgFlow +
      avgCta +
      avgConsistency) /
    8;

  return parseFloat(overall.toFixed(1));
}

export async function getReviewResult(contentId: string) {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    select: { id: true, status: true, revisionCount: true },
  });
  if (!content) throw new NotFoundError("Content not found.");

  const currentRound = content.revisionCount + 1;

  // Fetch all rounds
  const allReviews = await prisma.contentReview.findMany({
    where: { contentId },
    include: {
      reviewer: { select: { id: true, name: true, username: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const buildRoundResult = (round: number) => {
    const reviews = allReviews.filter((r) => r.reviewRound === round);
    if (reviews.length === 0) return null;

    const hasMinimum = reviews.length >= MIN_REVIEWERS;
    let criteria = null;
    let overall = null;

    if (hasMinimum) {
      const count = reviews.length;
      criteria = {
        accuracy: parseFloat((reviews.reduce((s, r) => s + r.accuracyScore, 0) / count).toFixed(1)),
        relevance: parseFloat((reviews.reduce((s, r) => s + r.relevanceScore, 0) / count).toFixed(1)),
        clarity: parseFloat((reviews.reduce((s, r) => s + r.clarityScore, 0) / count).toFixed(1)),
        hook: parseFloat((reviews.reduce((s, r) => s + r.hookScore, 0) / count).toFixed(1)),
        value: parseFloat((reviews.reduce((s, r) => s + r.valueScore, 0) / count).toFixed(1)),
        flow: parseFloat((reviews.reduce((s, r) => s + r.flowScore, 0) / count).toFixed(1)),
        cta: parseFloat((reviews.reduce((s, r) => s + r.ctaScore, 0) / count).toFixed(1)),
        consistency: parseFloat(
          (reviews.reduce((s, r) => s + r.consistencyScore, 0) / count).toFixed(1)
        ),
      };
      overall = calculateOverallScore(reviews);
    }

    return {
      round,
      reviewCount: reviews.length,
      hasMinimum,
      criteria,
      overall,
      reviews,
    };
  };

  const round1 = buildRoundResult(1);
  const round2 = content.revisionCount >= 1 ? buildRoundResult(2) : null;

  return {
    contentId,
    currentStatus: content.status,
    minReviewers: MIN_REVIEWERS,
    currentRound,
    round1,
    round2,
  };
}
