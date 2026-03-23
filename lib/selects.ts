export const CAR_CARD_FIELDS = [
  'id',
  'slug',
  'title',
  'brand',
  'model',
  'year',
  'images',
  'price_per_day',
  'price_buy',
  'is_for_rent',
  'location',
  'status',
  'closed_at',
  'created_at',
].join(',')

export const CAR_HOME_FIELDS = [
  CAR_CARD_FIELDS,
  'views_count',
].join(',')

export const PART_CARD_FIELDS = [
  'id',
  'slug',
  'title',
  'category',
  'brand',
  'images',
  'price',
  'seller',
  'created_at',
].join(',')

export const CAR_DETAIL_FIELDS = [
  'id',
  'slug',
  'title',
  'brand',
  'model',
  'year',
  'description',
  'images',
  'location',
  'is_for_rent',
  'price_per_day',
  'price_buy',
  'seller',
  'body_type',
  'owner_id',
  'status',
  'closed_at',
  'created_at',
].join(',')

export const CAR_RELATED_FIELDS = [
  'id',
  'slug',
  'title',
  'brand',
  'model',
  'images',
  'location',
  'is_for_rent',
  'price_per_day',
  'price_buy',
  'seller',
  'body_type',
  'status',
  'closed_at',
  'created_at',
].join(',')

export const PART_DETAIL_FIELDS = [
  'id',
  'slug',
  'title',
  'brand',
  'category',
  'description',
  'images',
  'compatible_models',
  'price',
  'seller',
  'sku',
  'created_at',
].join(',')
