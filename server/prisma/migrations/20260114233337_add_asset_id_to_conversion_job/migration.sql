/*
  Warnings:

  - Added the required column `asset_id` to the `conversion_jobs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "conversion_jobs" ADD COLUMN     "asset_id" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "idx_conversion_asset_id" ON "conversion_jobs"("asset_id");

-- AddForeignKey
ALTER TABLE "conversion_jobs" ADD CONSTRAINT "conversion_jobs_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
