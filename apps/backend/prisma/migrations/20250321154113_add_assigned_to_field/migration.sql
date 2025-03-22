-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "isMine" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
