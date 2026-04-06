-- Migration 003: Vault Email Token
-- Adds vault_email_token to profiles so each user has a unique upload email address

alter table public.profiles
  add column if not exists vault_email_token text unique,
  add column if not exists push_subscription  jsonb;  -- stores web push subscription

-- Index for fast lookup by token (used on every inbound email)
create index if not exists profiles_vault_email_token_idx
  on public.profiles(vault_email_token);

-- The vault_email_token is PRIVATE — only the owning user can see it
-- (default RLS already covers this since profiles RLS = auth.uid() = id)

-- Generate tokens for existing users (run once after migration)
-- In production, tokens are generated on first request via /api/email/vault-address
-- update public.profiles
--   set vault_email_token = encode(gen_random_bytes(8), 'hex')
--   where vault_email_token is null;
