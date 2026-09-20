-- Source only: applying this migration requires separate provisioning approval.
ALTER TABLE "Vehicle" ADD COLUMN "reviewedEquipmentId" TEXT;
