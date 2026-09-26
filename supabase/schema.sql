-- Pomidor / Bozor-Analitika
-- Supabase → SQL Editor → Run

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  role text not null default 'Xaridor',
  phone text not null default '',
  email text not null default '',
  region text not null default 'Toshkent viloyati',
  alerts boolean not null default true,
  plan text not null default 'free' check (plan in ('free', 'plus', 'pro')),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  product_id text primary key,
  image_url text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.p2p_offers (
  id uuid primary key default gen_random_uuid(),
  side text not null check (side in ('buy', 'sell')),
  product_id text not null,
  product_name text not null,
  seller text not null,
  verified boolean not null default false,
  rating numeric(5,2) not null default 97,
  trades integer not null default 0,
  price numeric(12,2) not null check (price > 0),
  available numeric(12,2) not null check (available > 0),
  min_kg numeric(12,2) not null default 10,
  max_kg numeric(12,2) not null default 80,
  payment text not null,
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

alter table public.profiles enable row level security;
alter table public.product_images enable row level security;
alter table public.p2p_offers enable row level security;
alter table public.p2p_trades enable row level security;

drop policy if exists "profiles_all" on public.profiles;
create policy "profiles_all" on public.profiles for all using (true) with check (true);

drop policy if exists "images_all" on public.product_images;
create policy "images_all" on public.product_images for all using (true) with check (true);

drop policy if exists "offers_all" on public.p2p_offers;
create policy "offers_all" on public.p2p_offers for all using (true) with check (true);

drop policy if exists "trades_all" on public.p2p_trades;
create policy "trades_all" on public.p2p_trades for all using (true) with check (true);

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

insert into public.p2p_offers (side, product_id, product_name, seller, verified, rating, trades, price, available, min_kg, max_kg, payment, region)
select * from (
  values
    ('sell','pomidor','Pomidor','Agro Fresh', true, 99.1, 428, 9200, 180, 10, 80, 'Naqd', 'Toshkent shahri'),
    ('buy','pomidor','Pomidor','Samarqand Dehqon', true, 98.4, 312, 9450, 220, 10, 95, 'Uzcard', 'Samarqand'),
    ('sell','pomidor','Pomidor','Toshkent Opt', true, 98.9, 640, 9100, 400, 20, 120, 'Humo', 'Toshkent viloyati'),
    ('buy','bodring','Bodring','Namangan Green', false, 96.8, 154, 7400, 150, 10, 70, 'Click', 'Namangan'),
    ('sell','bodring','Bodring','Farg‘ona Plus', true, 99.4, 510, 7250, 260, 10, 90, 'Payme', 'Farg‘ona'),
    ('sell','kartoshka','Kartoshka','Buxoro Savdo', true, 97.6, 201, 5100, 500, 20, 150, 'Naqd', 'Buxoro'),
    ('buy','kartoshka','Kartoshka','Andijon Bozor', false, 95.2, 88, 5300, 190, 10, 80, 'Uzcard', 'Andijon'),
    ('sell','piyoz','Piyoz','Xorazm Farm', false, 94.7, 67, 3050, 320, 10, 100, 'Humo', 'Xorazm'),
    ('buy','piyoz','Piyoz','Agro Fresh', true, 99.1, 428, 3180, 140, 10, 60, 'Click', 'Toshkent shahri'),
    ('sell','sabzi','Sabzi','Samarqand Dehqon', true, 98.4, 312, 5650, 210, 10, 80, 'Payme', 'Samarqand'),
    ('buy','qalampir','Qalampir','Namangan Green', false, 96.8, 154, 9900, 90, 5, 40, 'Naqd', 'Namangan'),
    ('sell','qalampir','Qalampir','Toshkent Opt', true, 98.9, 640, 9700, 160, 10, 70, 'Uzcard', 'Toshkent viloyati'),
    ('sell','karam','Karam','Buxoro Savdo', true, 97.6, 201, 4100, 280, 10, 90, 'Humo', 'Buxoro'),
    ('buy','olma','Olma','Farg‘ona Plus', true, 99.4, 510, 16200, 170, 10, 80, 'Click', 'Farg‘ona'),
    ('sell','olma','Olma','Andijon Bozor', false, 95.2, 88, 15900, 130, 10, 60, 'Payme', 'Andijon'),
    ('buy','uzum','Uzum','Agro Fresh', true, 99.1, 428, 16800, 110, 10, 50, 'Naqd', 'Toshkent shahri'),
    ('sell','uzum','Uzum','Samarqand Dehqon', true, 98.4, 312, 16400, 200, 10, 80, 'Uzcard', 'Samarqand'),
    ('sell','tarvuz','Tarvuz','Xorazm Farm', false, 94.7, 67, 2800, 350, 20, 120, 'Humo', 'Xorazm'),
    ('buy','tarvuz','Tarvuz','Toshkent Opt', true, 98.9, 640, 2950, 240, 20, 100, 'Click', 'Toshkent viloyati')
) as seed(side, product_id, product_name, seller, verified, rating, trades, price, available, min_kg, max_kg, payment, region)
where not exists (select 1 from public.p2p_offers limit 1);
