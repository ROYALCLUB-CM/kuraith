/*
  Warnings:

  - You are about to drop the column `content` on the `handoffs` table. All the data in the column will be lost.
  - You are about to drop the column `project` on the `handoffs` table. All the data in the column will be lost.
  - You are about to drop the column `session_id` on the `handoffs` table. All the data in the column will be lost.
  - Added the required column `context` to the `handoffs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "handoffs" DROP CONSTRAINT "handoffs_session_id_fkey";

-- DropForeignKey
ALTER TABLE "trace_links" DROP CONSTRAINT "trace_links_source_id_fkey";

-- DropForeignKey
ALTER TABLE "trace_links" DROP CONSTRAINT "trace_links_target_id_fkey";

-- AlterTable
ALTER TABLE "handoffs" DROP COLUMN "content",
DROP COLUMN "project",
DROP COLUMN "session_id",
ADD COLUMN     "context" TEXT NOT NULL,
ADD COLUMN     "from_session_id" TEXT,
ADD COLUMN     "next_steps" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "warnings" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "agent" TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN     "discoveries" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AddForeignKey
ALTER TABLE "handoffs" ADD CONSTRAINT "handoffs_from_session_id_fkey" FOREIGN KEY ("from_session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trace_links" ADD CONSTRAINT "trace_links_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trace_links" ADD CONSTRAINT "trace_links_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
