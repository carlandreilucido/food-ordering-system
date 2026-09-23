-- Run this file once in Supabase Dashboard > SQL Editor.
-- It creates an insert-only orders table for the public web application.

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null
    check (char_length(btrim(customer_name)) between 2 and 100),
  food_name text not null,
  unit_price numeric(10, 2) not null check (unit_price > 0),
  quantity integer not null check (quantity between 1 and 20),
  total_price numeric(12, 2)
    generated always as (unit_price * quantity) stored,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Visitors can submit only the fields needed to place an order. They cannot
-- select, update, or delete orders, so customer details remain private.
revoke all on table public.orders from anon, authenticated;

grant insert (
  customer_name,
  food_name,
  unit_price,
  quantity
) on table public.orders to anon, authenticated;

create policy "Customers can place valid menu orders"
on public.orders
for insert
to anon, authenticated
with check (
  quantity between 1 and 20
  and (
    (food_name = 'Classic Cheeseburger' and unit_price = 149.00)
    or (food_name = 'Margherita Pizza' and unit_price = 249.00)
    or (food_name = 'Chicken Teriyaki' and unit_price = 189.00)
    or (food_name = 'Creamy Carbonara' and unit_price = 179.00)
    or (food_name = 'Beef Tacos' and unit_price = 169.00)
    or (food_name = 'Garden Salad' and unit_price = 129.00)
  )
);

comment on table public.orders is
  'Customer orders submitted by the Savory food ordering web application.';
