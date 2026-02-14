/*
  Warnings:

  - You are about to drop the column `budget` on the `service_requests` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `service_requests` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `service_requests` table. All the data in the column will be lost.
  - Added the required column `preferredDate` to the `service_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preferredTime` to the `service_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `service_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "service_requests" DROP COLUMN "budget",
DROP COLUMN "date",
DROP COLUMN "time",
ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "cancelledBy" TEXT,
ADD COLUMN     "estimatedBudget" DOUBLE PRECISION,
ADD COLUMN     "finalPrice" DOUBLE PRECISION,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "preferredDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "preferredTime" TEXT NOT NULL,
ADD COLUMN     "scheduledDate" TIMESTAMP(3),
ADD COLUMN     "title" TEXT NOT NULL;
