-- RLS policy granting authenticated users read access to the
-- LegohandGesetzbuch storage bucket (the LHGB markdown source file).
--
-- Not run by any migration tooling (this repo has no supabase/migrations
-- folder) — this is checked in purely as version-controlled documentation.
-- Apply it once, top to bottom, in the Supabase SQL editor.
--
-- IMPORTANT: make sure the "LegohandGesetzbuch" bucket is NOT marked
-- "Public" in the Supabase dashboard — a public bucket serves objects via
-- a public URL that bypasses RLS entirely, making this policy pointless.
--
-- See backend/src/lib/gesetzbuchLoader.ts and backend/src/lib/supabaseClient.ts
-- (supabaseAsUser) for the backend side that calls this.

drop policy if exists gesetzbuch_authenticated_read on storage.objects;
create policy gesetzbuch_authenticated_read on storage.objects
  for select
  to authenticated
  using (bucket_id = 'LegohandGesetzbuch');
