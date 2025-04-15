/*
  Warnings:

  - You are about to drop the `AssistantAppointment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BarberAppointment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "AssistantAppointment";

-- DropTable
DROP TABLE "BarberAppointment";

-- CreateTable
CREATE TABLE "ClosedSlot" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClosedSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClosedSlot_userId_idx" ON "ClosedSlot"("userId");

-- CreateIndex
CREATE INDEX "ClosedSlot_date_idx" ON "ClosedSlot"("date");

-- AddForeignKey
ALTER TABLE "ClosedSlot" ADD CONSTRAINT "ClosedSlot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AllowedUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
