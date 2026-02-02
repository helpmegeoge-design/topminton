# Supabase RLS Fix for Notifications

The error `new row violates row-level security policy` occurs because the database is protecting the `notifications` table from being written to by users.

Since our application logic (Kicking members, Inviting friends, Testing notifications) runs on the client-side, we need to allow authenticated users to insert records into this table.

Please run the following SQL command in your **Supabase Dashboard > SQL Editor**:

```sql
-- Enable RLS on the table (if not already enabled)
alter table "public"."notifications" enable row level security;

-- Allow users to view their own notifications
create policy "Users can view their own notifications"
on "public"."notifications"
as permissive
for select
to authenticated
using ( (select auth.uid()) = user_id );

-- Allow authenticated users to create notifications (Required for Invite/Kick/Test features)
create policy "Users can insert notifications"
on "public"."notifications"
as permissive
for insert
to authenticated
with check ( true );

-- Allow users to update their own notifications (e.g. mark as read)
create policy "Users can update their own notifications"
on "public"."notifications"
as permissive
for update
to authenticated
using ( (select auth.uid()) = user_id );
```

after running this, try the "Test" button again.
