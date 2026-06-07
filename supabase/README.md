# Supabase Setup

Run `supabase/schema.sql` in the Supabase SQL Editor for this project before using the admin
content APIs.

The schema creates the real tables used by the app:

- `articles`
- `dreams`
- `faqs`
- `site_content`
- `contact_messages`
- `leads`

The app intentionally returns API errors when these tables are missing, instead of showing demo
or fallback data.
