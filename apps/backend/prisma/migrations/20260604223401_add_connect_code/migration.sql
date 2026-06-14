/*
  Warnings:

  - A unique constraint covering the columns `[connectCode]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "connectCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_connectCode_key" ON "user"("connectCode");
