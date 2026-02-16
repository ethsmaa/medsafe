-- CreateEnum
CREATE TYPE "CareTeamStatus" AS ENUM ('INVITED', 'ACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "MedicationFrequency" AS ENUM ('DAILY', 'WEEKLY', 'AS_NEEDED', 'PERIODIC');

-- CreateTable
CREATE TABLE "patient_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "gender" TEXT,
    "medicalHistory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caregiver_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialty" TEXT,
    "institution" TEXT,
    "licenseNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caregiver_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_team_member" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "status" "CareTeamStatus" NOT NULL DEFAULT 'INVITED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_team_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication" (
    "id" TEXT NOT NULL,
    "nameGeneric" TEXT NOT NULL,
    "nameBrand" TEXT,
    "description" TEXT,
    "manufacturer" TEXT,
    "packageSize" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "issuedBy" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_medication" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "prescriptionId" TEXT,
    "dosageAmount" TEXT NOT NULL,
    "frequency" "MedicationFrequency" NOT NULL,
    "instructions" TEXT,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "totalPrescribed" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescription_medication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_profile_userId_key" ON "patient_profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "caregiver_profile_userId_key" ON "caregiver_profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "care_team_member_patientId_caregiverId_key" ON "care_team_member"("patientId", "caregiverId");

-- CreateIndex
CREATE UNIQUE INDEX "prescription_code_key" ON "prescription"("code");

-- AddForeignKey
ALTER TABLE "patient_profile" ADD CONSTRAINT "patient_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caregiver_profile" ADD CONSTRAINT "caregiver_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_team_member" ADD CONSTRAINT "care_team_member_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_team_member" ADD CONSTRAINT "care_team_member_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "caregiver_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_medication" ADD CONSTRAINT "prescription_medication_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_medication" ADD CONSTRAINT "prescription_medication_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_medication" ADD CONSTRAINT "prescription_medication_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
