-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CDC_CHAIRMAN', 'CDC_HEAD', 'FACULTY_COORDINATOR', 'STUDENT_COORDINATOR');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('LEAD_FOUND', 'COLD_OUTREACH_PENDING', 'COLD_EMAIL_SENT', 'FOLLOWUP_PENDING', 'FOLLOWUP_DONE', 'INTERESTED', 'PPT_SCHEDULED', 'OA_SCHEDULED', 'INTERVIEW_SCHEDULED', 'HIRING_IN_PROGRESS', 'OFFER_RELEASED', 'REJECTED', 'NO_RESPONSE', 'ON_HOLD', 'CLOSED');

-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('PRODUCT', 'SERVICE', 'STARTUP', 'MNC', 'PSU', 'NGO', 'CONSULTANCY', 'FINTECH', 'EDTECH', 'HEALTHTECH', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('EMAIL', 'CALL', 'WHATSAPP', 'LINKEDIN', 'MEETING', 'PPT', 'FOLLOWUP', 'OA_DISCUSSION', 'INTERVIEW_COORDINATION', 'INTERNAL_DISCUSSION', 'NOTE');

-- CreateEnum
CREATE TYPE "AlumniStatus" AS ENUM ('NOT_CONTACTED', 'CONTACTED', 'RESPONDED', 'INTERESTED', 'REFERRED', 'NOT_INTERESTED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FollowUpType" AS ENUM ('EMAIL', 'CALL', 'WHATSAPP', 'MEETING', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT_COORDINATOR',
    "phone" TEXT,
    "department" TEXT,
    "year" INTEGER,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "domain" TEXT,
    "website" TEXT,
    "linkedin" TEXT,
    "companyType" "CompanyType",
    "industry" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "currentStatus" "CompanyStatus" NOT NULL DEFAULT 'LEAD_FOUND',
    "description" TEXT,
    "notes" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "assignedCoordinatorId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "linkedin" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyStatusLog" (
    "id" TEXT NOT NULL,
    "oldStatus" "CompanyStatus",
    "newStatus" "CompanyStatus" NOT NULL,
    "notes" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,

    CONSTRAINT "CompanyStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "summary" TEXT NOT NULL,
    "notes" TEXT,
    "nextAction" TEXT,
    "nextFollowUpDate" TIMESTAMP(3),
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "followUpDate" TIMESTAMP(3) NOT NULL,
    "followUpType" "FollowUpType" NOT NULL DEFAULT 'EMAIL',
    "subject" TEXT,
    "notes" TEXT,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alumni" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "batch" INTEGER NOT NULL,
    "branch" TEXT NOT NULL,
    "currentCompany" TEXT,
    "designation" TEXT,
    "linkedin" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "willingToHelp" BOOLEAN NOT NULL DEFAULT false,
    "referralCapability" BOOLEAN NOT NULL DEFAULT false,
    "currentStatus" "AlumniStatus" NOT NULL DEFAULT 'NOT_CONTACTED',
    "notes" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "assignedCoordinatorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alumni_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlumniActivity" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "summary" TEXT NOT NULL,
    "notes" TEXT,
    "nextAction" TEXT,
    "nextFollowUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alumniId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "AlumniActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "oldData" JSONB,
    "newData" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "Company_currentStatus_idx" ON "Company"("currentStatus");

-- CreateIndex
CREATE INDEX "Company_companyName_idx" ON "Company"("companyName");

-- CreateIndex
CREATE INDEX "Company_domain_idx" ON "Company"("domain");

-- CreateIndex
CREATE INDEX "Company_assignedCoordinatorId_idx" ON "Company"("assignedCoordinatorId");

-- CreateIndex
CREATE INDEX "Company_createdById_idx" ON "Company"("createdById");

-- CreateIndex
CREATE INDEX "Company_isDeleted_idx" ON "Company"("isDeleted");

-- CreateIndex
CREATE INDEX "Contact_companyId_idx" ON "Contact"("companyId");

-- CreateIndex
CREATE INDEX "Contact_email_idx" ON "Contact"("email");

-- CreateIndex
CREATE INDEX "CompanyStatusLog_companyId_idx" ON "CompanyStatusLog"("companyId");

-- CreateIndex
CREATE INDEX "CompanyStatusLog_changedAt_idx" ON "CompanyStatusLog"("changedAt");

-- CreateIndex
CREATE INDEX "CompanyStatusLog_newStatus_idx" ON "CompanyStatusLog"("newStatus");

-- CreateIndex
CREATE INDEX "Activity_companyId_idx" ON "Activity"("companyId");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "Activity"("type");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- CreateIndex
CREATE INDEX "Activity_nextFollowUpDate_idx" ON "Activity"("nextFollowUpDate");

-- CreateIndex
CREATE INDEX "FollowUp_companyId_idx" ON "FollowUp"("companyId");

-- CreateIndex
CREATE INDEX "FollowUp_followUpDate_idx" ON "FollowUp"("followUpDate");

-- CreateIndex
CREATE INDEX "FollowUp_status_idx" ON "FollowUp"("status");

-- CreateIndex
CREATE INDEX "FollowUp_reminderSent_idx" ON "FollowUp"("reminderSent");

-- CreateIndex
CREATE INDEX "Alumni_currentStatus_idx" ON "Alumni"("currentStatus");

-- CreateIndex
CREATE INDEX "Alumni_batch_idx" ON "Alumni"("batch");

-- CreateIndex
CREATE INDEX "Alumni_branch_idx" ON "Alumni"("branch");

-- CreateIndex
CREATE INDEX "Alumni_currentCompany_idx" ON "Alumni"("currentCompany");

-- CreateIndex
CREATE INDEX "Alumni_willingToHelp_idx" ON "Alumni"("willingToHelp");

-- CreateIndex
CREATE INDEX "AlumniActivity_alumniId_idx" ON "AlumniActivity"("alumniId");

-- CreateIndex
CREATE INDEX "AlumniActivity_type_idx" ON "AlumniActivity"("type");

-- CreateIndex
CREATE INDEX "AlumniActivity_createdAt_idx" ON "AlumniActivity"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_assignedCoordinatorId_fkey" FOREIGN KEY ("assignedCoordinatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyStatusLog" ADD CONSTRAINT "CompanyStatusLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyStatusLog" ADD CONSTRAINT "CompanyStatusLog_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alumni" ADD CONSTRAINT "Alumni_assignedCoordinatorId_fkey" FOREIGN KEY ("assignedCoordinatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumniActivity" ADD CONSTRAINT "AlumniActivity_alumniId_fkey" FOREIGN KEY ("alumniId") REFERENCES "Alumni"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumniActivity" ADD CONSTRAINT "AlumniActivity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
