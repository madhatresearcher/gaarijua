# Listing Strategy

- The `cars` table stores both purchasable vehicles and rentals.
- A row is treated as a rental when `is_for_rent = true` and `price_per_day` is populated.
- When a user creates an ad, the UI should include dropdowns to capture both "Listing Type" (rental vs sale) and "Body Type" (SUV, estate, Sedan, coupe, pickup truck). The body-type value lives in the `body_type` column on `cars` so we can distinguish the recommended rails.
- Purchase-only listings keep `is_for_rent = false` and rely on `price_buy`.
- Mixed listings can set `is_for_rent = true` and also provide `price_buy`.
- The app filters by `is_for_rent` (rentals) or `price_buy` (sales) in the UI/server code.
- This keeps a single canonical table for shared metadata (title, images, seller) while using clear flags/columns to distinguish scenarios.
- Future improvements can add a `listing_type` column and DB constraints (e.g., require `price_per_day` when renting) without splitting the table.
