-- CreateTable
CREATE TABLE "TopicSubmission" (
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
    CONSTRAINT "TopicSubmission_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TopicSubmission_fid_fkey" FOREIGN KEY ("fid") REFERENCES "UserStreak" ("fid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fid" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "permissions" TEXT NOT NULL DEFAULT 'moderate',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" INTEGER
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Topic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "imageA" TEXT,
    "imageB" TEXT,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "submissionId" INTEGER,
    CONSTRAINT "Topic_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Topic_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "TopicSubmission" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Topic" ("categoryId", "createdAt", "endDate", "id", "imageA", "imageB", "isActive", "name", "optionA", "optionB", "startDate", "updatedAt") SELECT "categoryId", "createdAt", "endDate", "id", "imageA", "imageB", "isActive", "name", "optionA", "optionB", "startDate", "updatedAt" FROM "Topic";
DROP TABLE "Topic";
ALTER TABLE "new_Topic" RENAME TO "Topic";
CREATE INDEX "Topic_categoryId_idx" ON "Topic"("categoryId");
CREATE INDEX "Topic_isActive_idx" ON "Topic"("isActive");
CREATE INDEX "Topic_startDate_endDate_idx" ON "Topic"("startDate", "endDate");
CREATE INDEX "Topic_submissionId_idx" ON "Topic"("submissionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "TopicSubmission_fid_idx" ON "TopicSubmission"("fid");

-- CreateIndex
CREATE INDEX "TopicSubmission_categoryId_idx" ON "TopicSubmission"("categoryId");

-- CreateIndex
CREATE INDEX "TopicSubmission_status_idx" ON "TopicSubmission"("status");

-- CreateIndex
CREATE INDEX "TopicSubmission_reviewedBy_idx" ON "TopicSubmission"("reviewedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_fid_key" ON "Admin"("fid");

-- CreateIndex
CREATE INDEX "Admin_fid_idx" ON "Admin"("fid");
