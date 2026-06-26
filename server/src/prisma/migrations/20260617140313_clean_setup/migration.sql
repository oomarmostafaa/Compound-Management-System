-- DropIndex
DROP INDEX "Resident_nationalId_phone_idx";

-- CreateIndex
CREATE INDEX "Resident_nationalId_idx" ON "Resident"("nationalId");
