-- Add Meta platform fields to Bot table
ALTER TABLE "Bot" ADD COLUMN IF NOT EXISTS "instagramAccountId" TEXT;
ALTER TABLE "Bot" ADD COLUMN IF NOT EXISTS "instagramAccessToken" TEXT;
ALTER TABLE "Bot" ADD COLUMN IF NOT EXISTS "messengerPageId" TEXT;
ALTER TABLE "Bot" ADD COLUMN IF NOT EXISTS "messengerPageName" TEXT;
ALTER TABLE "Bot" ADD COLUMN IF NOT EXISTS "whatsappBusinessId" TEXT;
ALTER TABLE "Bot" ADD COLUMN IF NOT EXISTS "whatsappAccessToken" TEXT;
ALTER TABLE "Bot" ADD COLUMN IF NOT EXISTS "whatsappPhoneNumber" TEXT;
ALTER TABLE "Bot" ADD COLUMN IF NOT EXISTS "metaUserToken" TEXT;
ALTER TABLE "Bot" ADD COLUMN IF NOT EXISTS "metaTokenExpiresAt" TIMESTAMP(3);

-- Add platforms array to Broadcast table
ALTER TABLE "Broadcast" ADD COLUMN IF NOT EXISTS "platforms" TEXT[] DEFAULT ARRAY['telegram']::TEXT[];
