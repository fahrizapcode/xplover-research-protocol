import prisma from "../utils/prisma";
import { ContentStatus, VisualDesignStatus } from "@prisma/client";
import { NotFoundError, ForbiddenError, ValidationError } from "../utils/errors";
import { logActivity } from "./xcrService";
import { scheduleBlockchainAttestation } from "../blockchain/attestationService";

export async function getVisualQueue(designerId?: string) {
  return prisma.content.findMany({
    where: {
      status: {
        in: [
          ContentStatus.READY_FOR_VISUAL,
          ContentStatus.IN_VISUAL_DESIGN,
          ContentStatus.VISUAL_COMPLETED,
        ],
      },
    },
    include: {
      research: {
        select: { id: true, title: true, technologyCategory: true },
      },
      creator: { select: { id: true, name: true, username: true } },
      slides: { select: { id: true } },
      reviews: { select: { reviewRound: true, accuracyScore: true, relevanceScore: true, clarityScore: true, hookScore: true, valueScore: true, flowScore: true, ctaScore: true, consistencyScore: true } },
      visualDesign: {
        include: {
          designer: { select: { id: true, name: true, username: true } },
        },
      },
    },
    orderBy: { updatedAt: "asc" },
  });
}

export async function startVisualDesign(contentId: string, designerId: string) {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    select: { status: true },
  });
  if (!content) throw new NotFoundError("Content not found.");
  if (content.status !== ContentStatus.READY_FOR_VISUAL) {
    throw new ValidationError(
      "Content must be in READY_FOR_VISUAL status to start visual design."
    );
  }

  const [updated] = await prisma.$transaction([
    prisma.content.update({
      where: { id: contentId },
      data: { status: ContentStatus.IN_VISUAL_DESIGN },
    }),
    prisma.visualDesign.upsert({
      where: { contentId },
      create: {
        contentId,
        designerId,
        status: VisualDesignStatus.IN_PROGRESS,
      },
      update: {
        designerId,
        status: VisualDesignStatus.IN_PROGRESS,
        updatedAt: new Date(),
      },
    }),
  ]);

  await logActivity(designerId, "VISUAL_DESIGN_STARTED", "CONTENT", contentId);

  return updated;
}

export async function cancelVisualDesign(contentId: string, designerId: string) {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: { visualDesign: true },
  });
  if (!content) throw new NotFoundError("Content not found.");
  if (content.status !== ContentStatus.IN_VISUAL_DESIGN) {
    throw new ValidationError("Content is not in visual design status.");
  }

  const [updated] = await prisma.$transaction([
    prisma.content.update({
      where: { id: contentId },
      data: { status: ContentStatus.READY_FOR_VISUAL },
    }),
    prisma.visualDesign.delete({
      where: { contentId },
    }),
  ]);

  await logActivity(designerId, "VISUAL_DESIGN_CANCELLED", "CONTENT", contentId);

  return updated;
}

export async function completeVisualDesign(
  contentId: string,
  designerId: string,
  remark?: string
) {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: { visualDesign: true },
  });
  if (!content) throw new NotFoundError("Content not found.");
  if (content.status !== ContentStatus.IN_VISUAL_DESIGN) {
    throw new ValidationError("Content must be in IN_VISUAL_DESIGN status to complete.");
  }
  if (content.visualDesign?.designerId !== designerId) {
    throw new ForbiddenError("Only the assigned designer can complete this design.");
  }

  await prisma.$transaction([
    prisma.content.update({
      where: { id: contentId },
      data: { status: ContentStatus.VISUAL_COMPLETED },
    }),
    prisma.visualDesign.update({
      where: { contentId },
      data: {
        status: VisualDesignStatus.COMPLETED,
        remark: remark ?? null,
        updatedAt: new Date(),
      },
    }),
  ]);

  await logActivity(designerId, "VISUAL_DESIGN_COMPLETED", "CONTENT", contentId, { remark });

  const designer = await prisma.user.findUnique({
    where: { id: designerId },
    select: { walletAddress: true },
  });
  scheduleBlockchainAttestation(
    "CONTENT",
    contentId,
    designerId,
    designer?.walletAddress ?? null,
    "VISUAL_COMPLETED",
    0
  );
}

export async function reopenVisualDesign(
  contentId: string,
  designerId: string,
  remark?: string
) {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: { visualDesign: true },
  });
  if (!content) throw new NotFoundError("Content not found.");
  if (content.status !== ContentStatus.VISUAL_COMPLETED) {
    throw new ValidationError("Content must be in VISUAL_COMPLETED status to reopen.");
  }

  await prisma.$transaction([
    prisma.content.update({
      where: { id: contentId },
      data: { status: ContentStatus.IN_VISUAL_DESIGN },
    }),
    prisma.visualDesign.update({
      where: { contentId },
      data: {
        status: VisualDesignStatus.IN_PROGRESS,
        remark: remark ?? content.visualDesign?.remark,
        updatedAt: new Date(),
      },
    }),
  ]);

  await logActivity(designerId, "VISUAL_DESIGN_REOPENED", "CONTENT", contentId, { remark });
}

export async function publishContent(contentId: string, designerId: string) {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    select: { status: true },
  });
  if (!content) throw new NotFoundError("Content not found.");
  if (content.status !== ContentStatus.VISUAL_COMPLETED) {
    throw new ValidationError("Content must be in VISUAL_COMPLETED status to publish.");
  }

  await prisma.content.update({
    where: { id: contentId },
    data: { status: ContentStatus.PUBLISHED },
  });

  await logActivity(designerId, "CONTENT_PUBLISHED", "CONTENT", contentId);
}

export async function updateVisualDesign(
  contentId: string,
  designerId: string,
  remark: string
) {
  const design = await prisma.visualDesign.findUnique({ where: { contentId } });
  if (!design) throw new NotFoundError("Visual design not found.");
  if (design.designerId !== designerId) {
    throw new ForbiddenError("Only the assigned designer can update this design.");
  }

  return prisma.visualDesign.update({
    where: { contentId },
    data: { remark, updatedAt: new Date() },
  });
}
