create extension if not exists pgcrypto;

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  service_type text not null,
  addresses text not null,
  message text not null default '',
  source text not null default 'website',
  status text not null default 'received'
);

create index if not exists quote_requests_created_at_idx
  on public.quote_requests (created_at desc);

create index if not exists quote_requests_status_idx
  on public.quote_requests (status);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  order_id text not null unique,
  order_date timestamptz not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  customer_address text,
  service_description text not null,
  pickup_address text not null,
  delivery_address text not null,
  total_with_vat numeric(10,2) not null,
  vat_rate numeric(5,2) not null,
  vat_amount numeric(10,2) not null,
  net_amount numeric(10,2) not null,
  payment_method text not null check (payment_method in ('mobilepay', 'invoice')),
  payment_status text not null default 'pending',
  paid_at timestamptz,
  vipps_reference text unique
);

create index if not exists orders_order_date_idx
  on public.orders (order_date desc);

create index if not exists orders_payment_status_idx
  on public.orders (payment_status);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  service_type text not null,
  service_description text not null,
  pickup_address text,
  delivery_address text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending',
  notes text not null default '',
  order_id uuid references public.orders(id) on delete set null,
  quote_request_id uuid references public.quote_requests(id) on delete set null,
  constraint bookings_valid_time_range check (ends_at > starts_at)
);

create index if not exists bookings_time_range_idx
  on public.bookings (starts_at, ends_at);

create index if not exists bookings_status_idx
  on public.bookings (status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row
execute function public.set_updated_at();