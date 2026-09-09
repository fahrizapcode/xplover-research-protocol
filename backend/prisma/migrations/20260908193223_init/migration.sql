-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('RESEARCHER', 'PEER_REVIEWER', 'CONTENT_CREATOR', 'VISUAL_DESIGNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TechnologyCategory" AS ENUM ('ARTIFICIAL_INTELLIGENCE', 'WEB3', 'CYBERSECURITY', 'QUANTUM_COMPUTING', 'ROBOTICS', 'EMERGING_TECHNOLOGIES');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'APPROVED', 'READY_FOR_VISUAL', 'IN_VISUAL_DESIGN', 'VISUAL_COMPLETED', 'PUBLISHED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ContentAngle" AS ENUM ('EDUCATION', 'TECH_IMPACT', 'PRACTICAL_APPLICATION', 'CAREER', 'INDUSTRY', 'FUTURE');

-- CreateEnum
CREATE TYPE "TargetAudience" AS ENUM ('BEGINNER', 'STUDENT', 'DEVELOPER', 'TECH_ENTHUSIAST', 'RESEARCHER', 'PROFESSIONAL', 'GENERAL_PUBLIC');

-- CreateEnum
CREATE TYPE "VisualDesignStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "XcrTransactionType" AS ENUM ('RESEARCH_SUBMITTED', 'RESEARCH_REFERENCED_CONTENT_APPROVED', 'PEER_REVIEW_COMPLETED', 'ADMIN_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "AttestationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "walletAddress" TEXT,
    "xcrBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" "RoleName" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "paperUrl" TEXT NOT NULL,
    "publicationYear" INTEGER NOT NULL,
    "technologyCategory" "TechnologyCategory" NOT NULL,
    "problem" TEXT NOT NULL,
    "approach" TEXT NOT NULL,
    "keyFindings" TEXT NOT NULL,
    "researcherInsight" TEXT NOT NULL,
    "whyItMatters" TEXT NOT NULL,
    "whatCommunityShouldLearn" TEXT NOT NULL,
    "unclearParts" TEXT,
    "discussionQuestions" TEXT,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_ratings" (
    "id" TEXT NOT NULL,
    "researchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content" (
    "id" TEXT NOT NULL,
    "researchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetAudience" "TargetAudience" NOT NULL,
    "contentAngle" "ContentAngle" NOT NULL,
    "hook" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "cta" TEXT NOT NULL,
    "sources" TEXT[],
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "revisionCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_slides" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "slideNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_revisions" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "changedBy" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_reviews" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "accuracyScore" INTEGER NOT NULL,
    "relevanceScore" INTEGER NOT NULL,
    "clarityScore" INTEGER NOT NULL,
    "hookScore" INTEGER NOT NULL,
    "valueScore" INTEGER NOT NULL,
    "flowScore" INTEGER NOT NULL,
    "ctaScore" INTEGER NOT NULL,
    "consistencyScore" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "reviewRound" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visual_designs" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "designerId" TEXT NOT NULL,
    "status" "VisualDesignStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visual_designs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xcr_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "transactionType" "XcrTransactionType" NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xcr_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_attestations" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "contributionType" TEXT NOT NULL,
    "transactionHash" TEXT,
    "blockchainNetwork" TEXT NOT NULL DEFAULT 'arbitrumSepolia',
    "contractAddress" TEXT,
    "status" "AttestationStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blockchain_attestations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "user_roles"("userId", "roleId");

-- CreateIndex
CREATE INDEX "research_authorId_idx" ON "research"("authorId");

-- CreateIndex
CREATE INDEX "research_technologyCategory_idx" ON "research"("technologyCategory");

-- CreateIndex
CREATE INDEX "research_publicationYear_idx" ON "research"("publicationYear");

-- CreateIndex
CREATE INDEX "research_ratings_researchId_idx" ON "research_ratings"("researchId");

-- CreateIndex
CREATE UNIQUE INDEX "research_ratings_researchId_userId_key" ON "research_ratings"("researchId", "userId");

-- CreateIndex
CREATE INDEX "content_researchId_idx" ON "content"("researchId");

-- CreateIndex
CREATE INDEX "content_createdBy_idx" ON "content"("createdBy");

-- CreateIndex
CREATE INDEX "content_status_idx" ON "content"("status");

-- CreateIndex
CREATE INDEX "content_slides_contentId_idx" ON "content_slides"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "content_slides_contentId_slideNumber_key" ON "content_slides"("contentId", "slideNumber");

-- CreateIndex
CREATE INDEX "content_revisions_contentId_idx" ON "content_revisions"("contentId");

-- CreateIndex
CREATE INDEX "content_reviews_contentId_idx" ON "content_reviews"("contentId");

-- CreateIndex
CREATE INDEX "content_reviews_reviewerId_idx" ON "content_reviews"("reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "content_reviews_contentId_reviewerId_reviewRound_key" ON "content_reviews"("contentId", "reviewerId", "reviewRound");

-- CreateIndex
CREATE UNIQUE INDEX "visual_designs_contentId_key" ON "visual_designs"("contentId");

-- CreateIndex
CREATE INDEX "visual_designs_designerId_idx" ON "visual_designs"("designerId");

-- CreateIndex
CREATE INDEX "xcr_transactions_userId_idx" ON "xcr_transactions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "xcr_transactions_transactionType_referenceId_key" ON "xcr_transactions"("transactionType", "referenceId");

-- CreateIndex
CREATE INDEX "activity_logs_actorId_idx" ON "activity_logs"("actorId");

-- CreateIndex
CREATE INDEX "activity_logs_entityType_entityId_idx" ON "activity_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- CreateIndex
CREATE INDEX "blockchain_attestations_entityType_entityId_idx" ON "blockchain_attestations"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "blockchain_attestations_contributorId_idx" ON "blockchain_attestations"("contributorId");

-- CreateIndex
CREATE INDEX "blockchain_attestations_status_idx" ON "blockchain_attestations"("status");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research" ADD CONSTRAINT "research_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_ratings" ADD CONSTRAINT "research_ratings_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "research"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_ratings" ADD CONSTRAINT "research_ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "research"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_slides" ADD CONSTRAINT "content_slides_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_reviews" ADD CONSTRAINT "content_reviews_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_reviews" ADD CONSTRAINT "content_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visual_designs" ADD CONSTRAINT "visual_designs_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visual_designs" ADD CONSTRAINT "visual_designs_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xcr_transactions" ADD CONSTRAINT "xcr_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockchain_attestations" ADD CONSTRAINT "blockchain_attestations_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
