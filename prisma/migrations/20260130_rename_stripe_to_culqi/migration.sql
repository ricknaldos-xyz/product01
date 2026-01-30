-- Rename Stripe fields to Culqi in users table
ALTER TABLE "users" RENAME COLUMN "stripeCustomerId" TO "culqiCustomerId";
ALTER TABLE "users" RENAME COLUMN "stripeSubscriptionId" TO "culqiSubscriptionId";
ALTER TABLE "users" RENAME COLUMN "stripeCurrentPeriodEnd" TO "culqiCurrentPeriodEnd";

-- Rename unique index on culqiCustomerId
ALTER INDEX "users_stripeCustomerId_key" RENAME TO "users_culqiCustomerId_key";

-- Rename Stripe fields in shop_orders table
ALTER TABLE "shop_orders" RENAME COLUMN "stripePaymentIntentId" TO "culqiChargeId";
ALTER TABLE "shop_orders" DROP COLUMN IF EXISTS "stripeCheckoutSessionId";

-- Rename Stripe fields in stringing_orders table
ALTER TABLE "stringing_orders" RENAME COLUMN "stripePaymentIntentId" TO "culqiChargeId";
ALTER TABLE "stringing_orders" DROP COLUMN IF EXISTS "stripeCheckoutSessionId";

-- Rename Stripe field in coach_profiles table
ALTER TABLE "coach_profiles" RENAME COLUMN "stripeConnectId" TO "culqiConnectId";

-- Rename Stripe field in sport_addons table
ALTER TABLE "sport_addons" RENAME COLUMN "stripeSubscriptionId" TO "culqiSubscriptionId";
