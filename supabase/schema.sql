-- Marketch.uz — Supabase SQL Editor da to‘liq ishga tushiring (Run).
-- Table Editor: Table Editor → profiles → barcha foydalanuvchilar.
-- VIP berish (SQL):  select public.grant_vip('email@gmail.com', 30);
-- VIP olish:         select public.revoke_vip('email@gmail.com');

create extension if not exists "pgcrypto";

-- ========== PROFILES (Clerk foydalanuvchilar) ==========
create table if not exists public.profiles (
  id text primary key,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  picture text not null default '',
  region text not null default 'Toshkent viloyati',
  role text not null default 'user',
  plan text not null default 'free',
  vip boolean not null default false,
  vip_until timestamptz,
  status text not null default 'active',
  alerts boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists picture text not null default '';
alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists vip boolean not null default false;
alter table public.profiles add column if not exists vip_until timestamptz;
alter table public.profiles add column if not exists status text not null default 'active';
alter table public.profiles add column if not exists created_at timestamptz not null default now();

create index if not exists profiles_email_idx on public.profiles (lower(email));
create index if not exists profiles_vip_idx on public.profiles (vip);

-- VIP ni oddiy foydalanuvchi o‘zi yoqa olmaydi. Table Editor / SQL Editor — yoqadi.
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if session_user not in ('postgres', 'supabase_admin') then
      new.vip := false;
      new.role := 'user';
      if new.plan is null or new.plan = '' then
        new.plan := 'free';
      end if;
    end if;
    return new;
  end if;
  if session_user not in ('postgres', 'supabase_admin') then
    new.vip := old.vip;
    new.vip_until := old.vip_until;
    new.role := old.role;
    new.plan := old.plan;
    new.status := old.status;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect
before insert or update on public.profiles
for each row execute function public.protect_profile_privileges();

alter table public.profiles add column if not exists clerk_user_id text;
update public.profiles set clerk_user_id = id::text where coalesce(clerk_user_id, '') = '';
create unique index if not exists profiles_clerk_user_id_key on public.profiles (clerk_user_id);

create or replace function public.grant_vip(p_email text, p_days int default 30)
returns table (id text, email text, vip boolean, vip_until timestamptz)
language plpgsql
as $$
begin
  return query
  update public.profiles
  set
    vip = true,
    plan = 'pro',
    vip_until = now() + make_interval(days => greatest(p_days, 1)),
    updated_at = now()
  where lower(profiles.email) = lower(p_email)
  returning profiles.id, profiles.email, profiles.vip, profiles.vip_until;
end;
$$;

create or replace function public.revoke_vip(p_email text)
returns table (id text, email text, vip boolean)
language plpgsql
as $$
begin
  return query
  update public.profiles
  set vip = false, plan = 'free', vip_until = null, updated_at = now()
  where lower(profiles.email) = lower(p_email)
  returning profiles.id, profiles.email, profiles.vip;
end;
$$;

revoke all on function public.grant_vip(text, int) from public, anon, authenticated;
revoke all on function public.revoke_vip(text) from public, anon, authenticated;

-- ========== CATALOG / SIAT ==========
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null default 'sabzavot',
  unit text not null default 'kg',
  emoji text not null default '',
  enabled boolean not null default true
);

insert into public.products (id, name, category, unit, emoji)
values
  ('pomidor', 'Pomidor', 'sabzavot', 'kg', '🍅'),
  ('kartoshka', 'Kartoshka', 'sabzavot', 'kg', '🥔'),
  ('piyoz', 'Piyoz', 'sabzavot', 'kg', '🧅'),
  ('sabzi', 'Sabzi', 'sabzavot', 'kg', '🥕')
on conflict (id) do nothing;

create table if not exists public.product_images (
  product_id text primary key,
  image_url text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.market_prices (
  id bigint generated always as identity primary key,
  product_id text not null,
  date date not null,
  year int not null,
  month int not null,
  price numeric(14,2) not null,
  unit text not null default 'so''m/kg',
  source text not null default 'SIAT',
  dataset_id text not null default '1308',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, date, source, dataset_id)
);

-- ========== P2P / LOGISTICS ==========
create table if not exists public.p2p_listings (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text,
  side text not null check (side in ('buy', 'sell')),
  product_id text not null,
  product_name text not null,
  quantity numeric(14,2) not null check (quantity > 0),
  unit text not null default 'kg',
  price numeric(14,2) not null check (price > 0),
  region text not null default '',
  available_date date,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.p2p_requests (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text,
  product_id text not null,
  quantity numeric(14,2) not null,
  max_price numeric(14,2),
  region text not null default '',
  required_date date,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.p2p_matches (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid,
  request_id uuid,
  score int not null default 0,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.transport_listings (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text,
  vehicle_type text not null default '',
  capacity_tonnes numeric(12,2) not null default 0,
  origin text not null default '',
  destination text not null default '',
  price numeric(14,2) not null default 0,
  available_date date,
  company text not null default '',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.p2p_offers (
  id uuid primary key default gen_random_uuid(),
  side text not null check (side in ('buy', 'sell')),
  product_id text not null,
  product_name text not null,
  seller text not null,
  phone text not null default '',
  verified boolean not null default false,
  rating numeric(5,2) not null default 97,
  trades integer not null default 0,
  price numeric(12,2) not null,
  available numeric(12,2) not null,
  min_kg numeric(12,2) not null default 10,
  max_kg numeric(12,2) not null default 80,
  payment text not null default 'Naqd',
  region text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.p2p_trades (
  id uuid primary key default gen_random_uuid(),
  offer_id text not null,
  seller text not null,
  product_name text not null,
  price numeric(12,2) not null,
  created_at timestamptz not null default now()
);

-- ========== SUBSCRIPTIONS / ALERTS / FORECAST ==========
create table if not exists public.subscriptions (
  clerk_user_id text primary key,
  plan text not null default 'free',
  status text not null default 'active',
  payment_status text not null default 'none',
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  product_slug text not null,
  condition text not null check (condition in ('above', 'below', 'change')),
  threshold numeric(14,2) not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.forecasts (
  id bigint generated always as identity primary key,
  product_id text not null,
  horizon int not null,
  generated_at timestamptz not null default now(),
  current_price numeric(14,2),
  predicted_price numeric(14,2),
  range_low numeric(14,2),
  range_high numeric(14,2),
  model text not null default 'seasonal_linear',
  status text not null default 'active'
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text,
  channel text not null default 'in_app',
  title text not null default '',
  body text not null default '',
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists public.data_sync_logs (
  id bigint generated always as identity primary key,
  source text not null default 'SIAT',
  dataset_id text not null default '1308',
  status text not null,
  records int not null default 0,
  latest_month text not null default '',
  message text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.admin_settings (
  id int primary key default 1,
  site_name text not null default 'marketch.uz',
  logo_url text not null default '',
  premium_monthly_price text not null default '199000',
  announcement text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.admin_settings (id) values (1) on conflict (id) do nothing;

-- ========== RLS ==========
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.market_prices enable row level security;
alter table public.p2p_listings enable row level security;
alter table public.p2p_requests enable row level security;
alter table public.p2p_matches enable row level security;
alter table public.transport_listings enable row level security;
alter table public.p2p_offers enable row level security;
alter table public.p2p_trades enable row level security;
alter table public.subscriptions enable row level security;
alter table public.price_alerts enable row level security;
alter table public.forecasts enable row level security;
alter table public.notifications enable row level security;
alter table public.data_sync_logs enable row level security;
alter table public.admin_settings enable row level security;

drop policy if exists "profiles_all" on public.profiles;
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (true);
create policy "profiles_update" on public.profiles for update using (true) with check (true);

drop policy if exists "products_read" on public.products;
create policy "products_read" on public.products for select using (true);

drop policy if exists "images_all" on public.product_images;
create policy "images_all" on public.product_images for all using (true) with check (true);

drop policy if exists "market_prices_read" on public.market_prices;
create policy "market_prices_read" on public.market_prices for select using (true);

drop policy if exists "p2p_listings_all" on public.p2p_listings;
create policy "p2p_listings_all" on public.p2p_listings for all using (true) with check (true);

drop policy if exists "p2p_requests_all" on public.p2p_requests;
create policy "p2p_requests_all" on public.p2p_requests for all using (true) with check (true);

drop policy if exists "p2p_matches_read" on public.p2p_matches;
create policy "p2p_matches_read" on public.p2p_matches for select using (true);

drop policy if exists "transport_read" on public.transport_listings;
create policy "transport_read" on public.transport_listings for select using (true);

drop policy if exists "offers_all" on public.p2p_offers;
create policy "offers_all" on public.p2p_offers for all using (true) with check (true);

drop policy if exists "trades_all" on public.p2p_trades;
create policy "trades_all" on public.p2p_trades for all using (true) with check (true);

drop policy if exists "forecasts_read" on public.forecasts;
create policy "forecasts_read" on public.forecasts for select using (true);

drop policy if exists "admin_settings_read" on public.admin_settings;
create policy "admin_settings_read" on public.admin_settings for select using (true);

-- ========== STORAGE (rasmlar) ==========
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "images_read" on storage.objects;
create policy "images_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "images_write" on storage.objects;
create policy "images_write" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "images_update" on storage.objects;
create policy "images_update" on storage.objects
  for update to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "images_delete" on storage.objects;
create policy "images_delete" on storage.objects
  for delete to anon, authenticated
  using (bucket_id = 'product-images');
