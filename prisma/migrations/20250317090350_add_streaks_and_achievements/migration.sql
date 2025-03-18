-- CreateTable
CREATE TABLE "UserStreak" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fid" INTEGER NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 1,
    "longestStreak" INTEGER NOT NULL DEFAULT 1,
    "lastVoteDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalVotes" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "badgeIcon" TEXT NOT NULL,
    "badgeColor" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fid" INTEGER NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserAchievement_fid_fkey" FOREIGN KEY ("fid") REFERENCES "UserStreak" ("fid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "topicId" INTEGER NOT NULL,
    "fid" INTEGER NOT NULL,
    "choice" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_fid_fkey" FOREIGN KEY ("fid") REFERENCES "UserStreak" ("fid") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Vote" ("choice", "fid", "id", "timestamp", "topicId") SELECT "choice", "fid", "id", "timestamp", "topicId" FROM "Vote";
DROP TABLE "Vote";
ALTER TABLE "new_Vote" RENAME TO "Vote";
CREATE INDEX "Vote_topicId_idx" ON "Vote"("topicId");
CREATE INDEX "Vote_fid_idx" ON "Vote"("fid");
CREATE UNIQUE INDEX "Vote_topicId_fid_key" ON "Vote"("topicId", "fid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "UserStreak_fid_key" ON "UserStreak"("fid");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_name_key" ON "Achievement"("name");

-- CreateIndex
CREATE INDEX "UserAchievement_fid_idx" ON "UserAchievement"("fid");

-- CreateIndex
CREATE INDEX "UserAchievement_achievementId_idx" ON "UserAchievement"("achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_fid_achievementId_key" ON "UserAchievement"("fid", "achievementId");
