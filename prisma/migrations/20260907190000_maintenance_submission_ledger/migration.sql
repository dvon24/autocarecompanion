CREATE TABLE "MaintenanceSubmission" (
  "id" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "recordIds" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MaintenanceSubmission_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MaintenanceSubmission_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "MaintenanceSubmission_vehicleId_idx" ON "MaintenanceSubmission"("vehicleId");
