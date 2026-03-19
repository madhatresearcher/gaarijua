BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS cars_status_rent_created_idx ON public.cars (status, is_for_rent, created_at DESC);
CREATE INDEX IF NOT EXISTS cars_owner_created_idx ON public.cars (owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS cars_status_promoted_expires_idx ON public.cars (status, promoted, promoted_expires);
CREATE INDEX IF NOT EXISTS cars_status_views_count_idx ON public.cars (status, views_count DESC);
CREATE INDEX IF NOT EXISTS cars_price_per_day_idx ON public.cars (price_per_day);
CREATE INDEX IF NOT EXISTS cars_price_buy_idx ON public.cars (price_buy);
CREATE INDEX IF NOT EXISTS parts_created_at_idx ON public.parts (created_at DESC);
CREATE INDEX IF NOT EXISTS parts_price_idx ON public.parts (price);

CREATE INDEX IF NOT EXISTS cars_title_trgm_idx ON public.cars USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS cars_brand_trgm_idx ON public.cars USING gin (brand gin_trgm_ops);
CREATE INDEX IF NOT EXISTS cars_model_trgm_idx ON public.cars USING gin (model gin_trgm_ops);
CREATE INDEX IF NOT EXISTS cars_location_trgm_idx ON public.cars USING gin (location gin_trgm_ops);
CREATE INDEX IF NOT EXISTS parts_title_trgm_idx ON public.parts USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS parts_brand_trgm_idx ON public.parts USING gin (brand gin_trgm_ops);
CREATE INDEX IF NOT EXISTS parts_category_trgm_idx ON public.parts USING gin (category gin_trgm_ops);
CREATE INDEX IF NOT EXISTS parts_seller_trgm_idx ON public.parts USING gin (seller gin_trgm_ops);

COMMIT;
