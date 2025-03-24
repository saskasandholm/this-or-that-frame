/*
  Warnings:

  - You are about to drop the `_TopicToSubmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `slug` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `TopicSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `TopicSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Vote` table. All the data in the column will be lost.
  - Added the required column `name` to the `Topic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionA` to the `Topic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionB` to the `Topic` table without a default value. This is not possible if the table is not empty.
  - Made the column `categoryId` on table `Topic` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `name` to the `TopicSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionA` to the `TopicSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionB` to the `TopicSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_TopicToSubmission_B_index";

-- DropIndex
DROP INDEX "_TopicToSubmission_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_TopicToSubmission";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Achievement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "badgeIcon" TEXT NOT NULL,
    "badgeColor" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "tier" INTEGER NOT NULL DEFAULT 1,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "isShareable" BOOLEAN NOT NULL DEFAULT true,
    "shareImage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fid" INTEGER NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserAchievement_fid_fkey" FOREIGN KEY ("fid") REFERENCES "UserStreak" ("fid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserAchievementShare" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fid" INTEGER NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "userAchievementId" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "sharedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserAchievementShare_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserAchievementShare_userAchievementId_fkey" FOREIGN KEY ("userAchievementId") REFERENCES "UserAchievement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Admin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fid" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "permissions" TEXT NOT NULL DEFAULT 'moderate',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" INTEGER
);
INSERT INTO "new_Admin" ("createdAt", "fid", "id", "isActive", "permissions", "updatedAt") SELECT "createdAt", "fid", "id", "isActive", "permissions", "updatedAt" FROM "Admin";
DROP TABLE "Admin";
ALTER TABLE "new_Admin" RENAME TO "Admin";
CREATE UNIQUE INDEX "Admin_fid_key" ON "Admin"("fid");
CREATE INDEX "Admin_fid_idx" ON "Admin"("fid");
CREATE TABLE "new_Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Category" ("createdAt", "description", "id", "name", "updatedAt") SELECT "createdAt", "description", "id", "name", "updatedAt" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE TABLE "new_Topic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "imageA" TEXT,
    "imageB" TEXT,
    "votesA" INTEGER NOT NULL DEFAULT 0,
    "votesB" INTEGER NOT NULL DEFAULT 0,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "submissionId" INTEGER,
    CONSTRAINT "Topic_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "TopicSubmission" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Topic_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Topic" ("categoryId", "createdAt", "id", "updatedAt") SELECT "categoryId", "createdAt", "id", "updatedAt" FROM "Topic";
DROP TABLE "Topic";
ALTER TABLE "new_Topic" RENAME TO "Topic";
CREATE INDEX "Topic_categoryId_idx" ON "Topic"("categoryId");
CREATE INDEX "Topic_isActive_idx" ON "Topic"("isActive");
CREATE INDEX "Topic_startDate_idx" ON "Topic"("startDate");
CREATE INDEX "Topic_submissionId_idx" ON "Topic"("submissionId");
CREATE TABLE "new_TopicSubmission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "fid" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "reviewedAt" DATETIME,
    "reviewedBy" INTEGER,
    CONSTRAINT "TopicSubmission_fid_fkey" FOREIGN KEY ("fid") REFERENCES "UserStreak" ("fid") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TopicSubmission_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TopicSubmission" ("categoryId", "createdAt", "fid", "id", "reviewedAt", "reviewedBy", "status", "updatedAt") SELECT "categoryId", "createdAt", "fid", "id", "reviewedAt", "reviewedBy", "status", "updatedAt" FROM "TopicSubmission";
DROP TABLE "TopicSubmission";
ALTER TABLE "new_TopicSubmission" RENAME TO "TopicSubmission";
CREATE INDEX "TopicSubmission_fid_idx" ON "TopicSubmission"("fid");
CREATE INDEX "TopicSubmission_categoryId_idx" ON "TopicSubmission"("categoryId");
CREATE INDEX "TopicSubmission_status_idx" ON "TopicSubmission"("status");
CREATE INDEX "TopicSubmission_reviewedBy_idx" ON "TopicSubmission"("reviewedBy");
CREATE TABLE "new_UserStreak" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fid" INTEGER NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 1,
    "longestStreak" INTEGER NOT NULL DEFAULT 1,
    "lastVoteDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalVotes" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_UserStreak" ("createdAt", "currentStreak", "fid", "id", "lastVoteDate", "longestStreak", "updatedAt") SELECT "createdAt", "currentStreak", "fid", "id", coalesce("lastVoteDate", CURRENT_TIMESTAMP) AS "lastVoteDate", "longestStreak", "updatedAt" FROM "UserStreak";
DROP TABLE "UserStreak";
ALTER TABLE "new_UserStreak" RENAME TO "UserStreak";
CREATE UNIQUE INDEX "UserStreak_fid_key" ON "UserStreak"("fid");
CREATE TABLE "new_Vote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "topicId" INTEGER NOT NULL,
    "fid" INTEGER NOT NULL,
    "choice" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_fid_fkey" FOREIGN KEY ("fid") REFERENCES "UserStreak" ("fid") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vote_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Vote" ("choice", "fid", "id", "topicId") SELECT "choice", "fid", "id", "topicId" FROM "Vote";
DROP TABLE "Vote";
ALTER TABLE "new_Vote" RENAME TO "Vote";
CREATE INDEX "Vote_topicId_idx" ON "Vote"("topicId");
CREATE INDEX "Vote_fid_idx" ON "Vote"("fid");
CREATE UNIQUE INDEX "Vote_topicId_fid_key" ON "Vote"("topicId", "fid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_name_key" ON "Achievement"("name");

-- CreateIndex
CREATE INDEX "UserAchievement_fid_idx" ON "UserAchievement"("fid");

-- CreateIndex
CREATE INDEX "UserAchievement_achievementId_idx" ON "UserAchievement"("achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_fid_achievementId_key" ON "UserAchievement"("fid", "achievementId");

-- CreateIndex
CREATE INDEX "UserAchievementShare_fid_idx" ON "UserAchievementShare"("fid");

-- CreateIndex
CREATE INDEX "UserAchievementShare_achievementId_idx" ON "UserAchievementShare"("achievementId");

-- CreateIndex
CREATE INDEX "UserAchievementShare_userAchievementId_idx" ON "UserAchievementShare"("userAchievementId");
