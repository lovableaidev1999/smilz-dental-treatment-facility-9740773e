I checked the live network request from the Reviews admin page. The current error is not a Google API key problem anymore. The request is reaching Supabase, but Supabase is returning:

```text
404 NOT_FOUND
Requested function was not found
POST https://eukymrxxmvkchxfpjjuz.supabase.co/functions/v1/sync-google-reviews
```

So the actual issue is: the `sync-google-reviews` edge function exists in the codebase, but it is not deployed/available in the connected Supabase project yet.

## Plan

1. Fix the edge function deployment command
   - Update the GitHub Action so it deploys the specific function explicitly:
     ```text
     supabase functions deploy sync-google-reviews --project-ref eukymrxxmvkchxfpjjuz --no-verify-jwt
     ```
   - This avoids relying on implicit deploy-all behavior and ensures this exact function is published.

2. Keep the function callable from the admin page
   - Confirm `verify_jwt = false` remains configured for `sync-google-reviews`, because the admin page is already sending the Supabase auth headers and the function itself uses the service role key for controlled database writes.

3. Improve the admin error message
   - Update `/admin/reviews` so if the edge function is missing or unreachable, the toast says something actionable like:
     ```text
     Sync failed: Edge function is not deployed yet. Please redeploy Supabase functions.
     ```
   - This will make future errors easier to identify than the generic “Failed to send a request to the Edge Function”.

4. Add a direct verification step after deployment
   - After the deployment workflow runs, test the live endpoint again with an `OPTIONS`/function request.
   - Expected result should no longer be `404 NOT_FOUND`; it should return either a normal success JSON or a clear function-level JSON error.

## Technical details

Current confirmed live response:

```text
HTTP/2 404
sb-error-code: NOT_FOUND
{"code":"NOT_FOUND","message":"Requested function was not found"}
```

This means the browser/CORS and Google Places API are not the primary blocker right now. Supabase simply cannot find the deployed edge function at that project URL.

Once approved, I will update the deployment workflow and the admin error handling so the next deployment publishes the function correctly and reports clearer errors.