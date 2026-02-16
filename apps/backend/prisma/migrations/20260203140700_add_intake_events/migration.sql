-- CreateEnum
CREATE TYPE "IntakeStatus" AS ENUM ('TAKEN', 'SKIPPED', 'MISSED');

-- CreateTable
CREATE TABLE "intake_event" (
    "id" TEXT NOT NULL,
    "prescriptionMedicationId" TEXT NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "IntakeStatus" NOT NULL,
    "isOnTime" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intake_event_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "intake_event" ADD CONSTRAINT "intake_event_prescriptionMedicationId_fkey" FOREIGN KEY ("prescriptionMedicationId") REFERENCES "prescription_medication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
