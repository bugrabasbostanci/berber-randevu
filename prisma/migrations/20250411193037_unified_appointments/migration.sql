/*
  Warnings:

  - You are about to drop the column `barberId` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `name` to the `AllowedUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AllowedUser" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "barberId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "BarberAppointment" (
    "id" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BarberAppointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssistantAppointment" (
    "id" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssistantAppointment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AllowedUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
