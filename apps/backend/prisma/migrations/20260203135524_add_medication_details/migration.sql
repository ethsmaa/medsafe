-- CreateEnum
CREATE TYPE "MealStatus" AS ENUM ('BEFORE_MEAL', 'AFTER_MEAL', 'WITH_FOOD', 'ANY');

-- CreateEnum
CREATE TYPE "MedicationForm" AS ENUM ('TABLET', 'CAPSULE', 'SYRUP', 'CREAM', 'INJECTION', 'OTHER');

-- AlterTable
ALTER TABLE "prescription_medication" ADD COLUMN     "form" "MedicationForm" NOT NULL DEFAULT 'TABLET',
ADD COLUMN     "mealStatus" "MealStatus" NOT NULL DEFAULT 'ANY',
ADD COLUMN     "restockThreshold" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "dose_schedule" (
    "id" TEXT NOT NULL,
    "prescriptionMedicationId" TEXT NOT NULL,
    "timeOfDay" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dose_schedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dose_schedule" ADD CONSTRAINT "dose_schedule_prescriptionMedicationId_fkey" FOREIGN KEY ("prescriptionMedicationId") REFERENCES "prescription_medication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
