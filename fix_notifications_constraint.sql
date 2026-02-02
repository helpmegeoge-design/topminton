-- update constraint of notifications table

ALTER TABLE "public"."notifications" DROP CONSTRAINT IF EXISTS "notifications_type_check";
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_type_check" CHECK (type IN ('general', 'party_invite', 'match_start', 'payment_reminder', 'payment_verified', 'tournament', 'system', 'info', 'warning', 'error'));
