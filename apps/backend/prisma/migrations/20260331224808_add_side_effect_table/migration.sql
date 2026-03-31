-- AlterTable
ALTER TABLE "care_team_member" ADD COLUMN     "initiatedBy" TEXT NOT NULL DEFAULT 'CAREGIVER';

-- CreateTable
CREATE TABLE "side_effect" (
    "id" TEXT NOT NULL,
    "prescriptionMedicationId" TEXT,
    "patientId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "side_effect_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "side_effect" ADD CONSTRAINT "side_effect_prescriptionMedicationId_fkey" FOREIGN KEY ("prescriptionMedicationId") REFERENCES "prescription_medication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "side_effect" ADD CONSTRAINT "side_effect_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
