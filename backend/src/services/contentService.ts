import prisma from "../utils/prisma";
import {
  ContentStatus,
  ContentAngle,
  TargetAudience,
  RoleName,
} from "@prisma/client";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
  ConflictError,
} from "../utils/errors";
import { logActivity } from "./xcrService";

const VALID_TRANSITIONS: Partial<Record<ContentStatus, ContentStatus[]>> = {
  DRAFT: [ContentStatus.SUBMITTED],
  SUBMITTED: [ContentStatus.UNDER_REVIEW],
  UNDER_REVIEW: [
    ContentStatus.APPROVED,
    ContentStatus.REVISION_REQUIRED,
  ],
  REVISION_REQUIRED: [ContentStatus.SUBMITTED],
  APPROVED: [ContentStatus.READY_FOR_VISUAL],
  READY_FOR_VISUAL: [ContentStatus.IN_VISUAL_DESIGN],
  IN_VISUAL_DESIGN: [ContentStatus.VISUAL_COMPLETED],
  VISUAL_COMPLETED: [ContentStatus.PUBLISHED, ContentStatus.IN_VISUAL_DESIGN],
};

export function validateStatusTransition(
  current: ContentStatus,
  next: ContentStatus
): void {
  const allowed = VALID_TRANSITIONS[current] ?? [];
  if (!allowed.includes(next)) {
    throw new ValidationError(
      `Invalid status transition from ${current} to ${next}.`
    );
  }
}

export async function createContent(
  createdBy: string,
  data: {
    researchId: string;
    title: string;
    targetAudience: TargetAudience;
    contentAngle: ContentAngle;
    hook: string;
    headline: string;
    caption: string;
    cta: string;
    sources: string[];
    slides?: Array<{ title: string; body: string }>;
  }
) {
  // Verify research exists
  const research = await prisma.research.findUnique({
    where: { id: data.researchId },
  });
  if (!research) throw new NotFoundError("Research not found.");

  const { slides, ...contentData } = data;

  const content = await prisma.content.create({
    data: {
      ...contentData,
      createdBy,
      status: ContentStatus.UNDER_REVIEW,
      slides: slides
        ? {
            create: slides.map((slide, idx) => ({
              slideNumber: idx + 1,
              title: slide.title,
              body: slide.body,
            })),
          }
        : undefined,
    },
    include: {
      slides: { orderBy: { slideNumber: "asc" } },
      research: {
        select: { id: true, title: true, technologyCategory: true },
      },
      creator: {
        select: { id: true, name: true, username: true },
      },
    },
  });

  await logActivity(createdBy, "CONTENT_CREATED", "CONTENT", content.id, {
    title: content.title,
    researchId: data.researchId,
  });

  return content;
}

export async function getContent(id: string) {
  const content = await prisma.content.findUnique({
    where: { id },
    include: {
      slides: { orderBy: { slideNumber: "asc" } },
      research: {
        select: {
          id: true,
          title: true,
          technologyCategory: true,
          authorId: true,
          author: { select: { id: true, name: true, username: true } },
        },
      },
      creator: { select: { id: true, name: true, username: true, avatar: true } },
      revisions: { orderBy: { createdAt: "desc" } },
      visualDesign: {
        include: {
          designer: { select: { id: true, name: true, username: true } },
        },
      },
    },
  });

  if (!content) throw new NotFoundError("Content not found.");
  return content;
}

export async function listContent(params: {
  status?: ContentStatus;
  createdBy?: string;
  researchId?: string;
  page?: number;
  limit?: number;
}) {
  const { status, createdBy, researchId, page = 1, limit = 12 } = params;
  const where: any = {};
  if (status) where.status = status;
  if (createdBy) where.createdBy = createdBy;
  if (researchId) where.researchId = researchId;

  const [total, content] = await Promise.all([
    prisma.content.count({ where }),
    prisma.content.findMany({
      where,
      include: {
        slides: { select: { id: true } },
        research: { select: { id: true, title: true, technologyCategory: true } },
        creator: { select: { id: true, name: true, username: true } },
        reviews: { select: { id: true, reviewRound: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data: content,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function updateContent(
  id: string,
  userId: string,
  data: Partial<{
    title: string;
    targetAudience: TargetAudience;
    contentAngle: ContentAngle;
    hook: string;
    headline: string;
    caption: string;
    cta: string;
    sources: string[];
  }>
) {
  const content = await prisma.content.findUnique({ where: { id } });
  if (!content) throw new NotFoundError("Content not found.");
  if (content.createdBy !== userId)
    throw new ForbiddenError("You can only edit your own content.");
  if (
    content.status !== ContentStatus.DRAFT &&
    content.status !== ContentStatus.REVISION_REQUIRED
  ) {
    throw new ValidationError(
      "Content can only be edited when in DRAFT or REVISION_REQUIRED status."
    );
  }

  return prisma.content.update({ where: { id }, data });
}

export async function submitContent(id: string, userId: string) {
  const content = await prisma.content.findUnique({
    where: { id },
    include: { slides: true },
  });
  if (!content) throw new NotFoundError("Content not found.");
  if (content.createdBy !== userId)
    throw new ForbiddenError("You can only submit your own content.");

  if (
    content.status !== ContentStatus.DRAFT &&
    content.status !== ContentStatus.REVISION_REQUIRED
  ) {
    throw new ValidationError(
      "Content can only be submitted from DRAFT or REVISION_REQUIRED status."
    );
  }

  if (content.slides.length === 0) {
    throw new ValidationError("Content must have at least one slide before submitting.");
  }

  // DRAFT → SUBMITTED → UNDER_REVIEW (auto-transition)
  const updated = await prisma.content.update({
    where: { id },
    data: { status: ContentStatus.UNDER_REVIEW },
  });

  await logActivity(userId, "CONTENT_SUBMITTED", "CONTENT", id, {
    title: content.title,
  });

  return updated;
}

export async function reviseContent(
  id: string,
  userId: string,
  changes: {
    title?: string;
    hook?: string;
    headline?: string;
    caption?: string;
    cta?: string;
    sources?: string[];
    note?: string;
  }
) {
  const content = await prisma.content.findUnique({
    where: { id },
    include: { revisions: true },
  });
  if (!content) throw new NotFoundError("Content not found.");
  if (content.createdBy !== userId)
    throw new ForbiddenError("You can only revise your own content.");

  if (content.status !== ContentStatus.REVISION_REQUIRED) {
    throw new ValidationError("Content can only be revised when in REVISION_REQUIRED status.");
  }

  // Maximum 1 revision allowed
  if (content.revisionCount >= 1) {
    throw new ForbiddenError(
      "Maximum revision limit reached. No further revisions are allowed."
    );
  }

  const { note, ...contentChanges } = changes;

  // Create revision history snapshot + update content + move to UNDER_REVIEW
  const [revision, updated] = await prisma.$transaction([
    prisma.contentRevision.create({
      data: {
        contentId: id,
        version: content.revisionCount + 1,
        changedBy: userId,
        changes: {
          ...contentChanges,
          note,
          previousStatus: content.status,
        },
      },
    }),
    prisma.content.update({
      where: { id },
      data: {
        ...contentChanges,
        status: ContentStatus.UNDER_REVIEW,
        revisionCount: { increment: 1 },
      },
    }),
  ]);

  await logActivity(userId, "CONTENT_REVISED", "CONTENT", id, {
    version: revision.version,
  });

  return updated;
}

// ============================================================
// SLIDES
// ============================================================

export async function addSlide(
  contentId: string,
  userId: string,
  data: { title: string; body: string }
) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) throw new NotFoundError("Content not found.");
  if (content.createdBy !== userId)
    throw new ForbiddenError("You can only edit your own content.");
  if (
    content.status !== ContentStatus.DRAFT &&
    content.status !== ContentStatus.REVISION_REQUIRED
  ) {
    throw new ValidationError("Slides can only be modified in DRAFT or REVISION_REQUIRED status.");
  }

  const maxSlide = await prisma.contentSlide.findFirst({
    where: { contentId },
    orderBy: { slideNumber: "desc" },
  });

  return prisma.contentSlide.create({
    data: {
      contentId,
      slideNumber: (maxSlide?.slideNumber ?? 0) + 1,
      title: data.title,
      body: data.body,
    },
  });
}

export async function updateSlide(
  contentId: string,
  slideId: string,
  userId: string,
  data: { title?: string; body?: string }
) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) throw new NotFoundError("Content not found.");
  if (content.createdBy !== userId)
    throw new ForbiddenError("You can only edit your own content.");

  const slide = await prisma.contentSlide.findUnique({ where: { id: slideId } });
  if (!slide || slide.contentId !== contentId)
    throw new NotFoundError("Slide not found.");

  return prisma.contentSlide.update({ where: { id: slideId }, data });
}

export async function deleteSlide(
  contentId: string,
  slideId: string,
  userId: string
) {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: { slides: true },
  });
  if (!content) throw new NotFoundError("Content not found.");
  if (content.createdBy !== userId)
    throw new ForbiddenError("You can only edit your own content.");
  if (
    content.status !== ContentStatus.DRAFT &&
    content.status !== ContentStatus.REVISION_REQUIRED
  ) {
    throw new ValidationError("Slides can only be modified in DRAFT or REVISION_REQUIRED status.");
  }

  const slide = await prisma.contentSlide.findUnique({ where: { id: slideId } });
  if (!slide || slide.contentId !== contentId)
    throw new NotFoundError("Slide not found.");

  // Delete and renumber remaining slides
  await prisma.$transaction(async (tx) => {
    await tx.contentSlide.delete({ where: { id: slideId } });
    const remaining = await tx.contentSlide.findMany({
      where: { contentId },
      orderBy: { slideNumber: "asc" },
    });
    await Promise.all(
      remaining.map((s, idx) =>
        tx.contentSlide.update({
          where: { id: s.id },
          data: { slideNumber: idx + 1 },
        })
      )
    );
  });
}

export async function reorderSlides(
  contentId: string,
  userId: string,
  orderedIds: string[] // slide IDs in desired order
) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) throw new NotFoundError("Content not found.");
  if (content.createdBy !== userId)
    throw new ForbiddenError("You can only reorder your own content slides.");

  const slides = await prisma.contentSlide.findMany({ where: { contentId } });
  if (slides.length !== orderedIds.length) {
    throw new ValidationError("Ordered IDs must include all slides.");
  }

  const slideIds = new Set(slides.map((s) => s.id));
  if (!orderedIds.every((id) => slideIds.has(id))) {
    throw new ValidationError("Invalid slide IDs provided.");
  }

  await prisma.$transaction(
    orderedIds.map((slideId, idx) =>
      prisma.contentSlide.update({
        where: { id: slideId },
        data: { slideNumber: idx + 1 },
      })
    )
  );
}
