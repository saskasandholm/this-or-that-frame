/*
  Warnings:

  - Added the required column `name` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
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
    CONSTRAINT "Topic_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Topic" ("categoryId", "createdAt", "endDate", "id", "imageA", "imageB", "isActive", "optionA", "optionB", "startDate", "updatedAt") SELECT "categoryId", "createdAt", "endDate", "id", "imageA", "imageB", "isActive", "optionA", "optionB", "startDate", "updatedAt" FROM "Topic";
DROP TABLE "Topic";
ALTER TABLE "new_Topic" RENAME TO "Topic";
CREATE INDEX "Topic_categoryId_idx" ON "Topic"("categoryId");
CREATE INDEX "Topic_isActive_idx" ON "Topic"("isActive");
CREATE INDEX "Topic_startDate_endDate_idx" ON "Topic"("startDate", "endDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
