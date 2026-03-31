-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "operatorMode" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "platformChatId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "language" TEXT,
    "tags" TEXT[],
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "firstContact" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastContact" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Customer_botId_idx" ON "Customer"("botId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_botId_platformChatId_platform_key" ON "Customer"("botId", "platformChatId", "platform");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
