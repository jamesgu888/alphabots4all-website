-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "confirmToken" TEXT,
ADD COLUMN     "emailConfirmed" BOOLEAN NOT NULL DEFAULT false;
