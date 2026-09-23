# Food Ordering System

A responsive food ordering website built with HTML, JavaScript, Bootstrap, and
Supabase. Customers can select a meal, set a quantity, see the total instantly,
and submit their order to Supabase.

## Live Website

<https://carlandreilucido.github.io/food-ordering-system/>

## Features

- Six food items with names, descriptions, images, and Philippine peso prices
- Clickable food cards synchronized with the order form
- Quantity controls and automatic total calculation
- Customer and order validation
- Supabase order storage with loading, success, and error feedback
- Insert-only Row Level Security that prevents public access to customer orders
- Responsive Bootstrap layout for desktop, tablet, and mobile screens

## Technologies

- HTML5
- CSS3
- JavaScript
- Bootstrap 5.3
- Supabase JavaScript SDK 2
- Supabase PostgreSQL

## Supabase Setup

1. Open the [Supabase Dashboard](https://supabase.com/dashboard).
2. Select the project used by this application.
3. Open **SQL Editor** and create a new query.
4. Copy all SQL from [`supabase.sql`](supabase.sql) into the query.
5. Click **Run**.

The script creates `public.orders`, enables Row Level Security, permits public
inserts, and prevents public reads, updates, and deletes. The database computes
`total_price` from `unit_price * quantity`.

The application uses a browser-safe Supabase publishable key in `app.js`. Never
place a Supabase service-role key in frontend code.

## Run Locally With XAMPP

1. Place this project at `C:\xampp\htdocs\foodOrdering`.
2. Start Apache from the XAMPP Control Panel.
3. Open <http://localhost/foodOrdering/>.
4. Import `supabase.sql` before submitting an order.

No package installation or build command is required because Bootstrap and the
Supabase SDK are loaded from CDNs.

## Order Data

Each successful order stores:

- Customer name
- Food name
- Unit price
- Quantity
- Computed total price
- Creation timestamp

## Repository

<https://github.com/carlandreilucido/food-ordering-system>
