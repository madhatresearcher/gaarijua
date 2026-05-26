import {
  pgTable,
  text,
  uuid,
  integer,
  numeric,
  boolean,
  timestamp,
  primaryKey,
} from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from 'next-auth/adapters'

/* -------------------------------------------------------------------------- */
/*  Auth.js (NextAuth) tables — also carry the app's profile fields            */
/* -------------------------------------------------------------------------- */

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  // App profile fields (previously the `profiles` table)
  displayName: text('display_name'),
  role: text('role').notNull().default('user'),
  vendorType: text('vendor_type'),
  phone: text('phone'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
)

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
)

/* -------------------------------------------------------------------------- */
/*  Domain tables                                                              */
/* -------------------------------------------------------------------------- */

export const cars = pgTable('cars', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  brand: text('brand'),
  model: text('model'),
  year: integer('year'),
  description: text('description'),
  images: text('images').array(),
  slug: text('slug').unique(),
  isForRent: boolean('is_for_rent').default(false),
  seller: text('seller'),
  promoted: boolean('promoted').default(false),
  promotedExpires: timestamp('promoted_expires', { withTimezone: true }),
  viewsCount: integer('views_count').default(0),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  bodyType: text('body_type'),
  pricePerDay: numeric('price_per_day', { precision: 10, scale: 2 }),
  priceBuy: numeric('price_buy', { precision: 12, scale: 2 }),
  location: text('location'),
  mileage: integer('mileage'),
  status: text('status').notNull().default('active'),
  ownerId: uuid('owner_id').references(() => users.id),
  rentalCompanyId: uuid('rental_company_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const parts = pgTable('parts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  category: text('category'),
  brand: text('brand'),
  price: numeric('price', { precision: 10, scale: 2 }),
  description: text('description'),
  images: text('images').array(),
  seller: text('seller'),
  compatibleModels: text('compatible_models').array(),
  sku: text('sku'),
  slug: text('slug').unique(),
  ownerId: uuid('owner_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  vehicleId: uuid('vehicle_id')
    .notNull()
    .references(() => cars.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  rentalCompanyId: uuid('rental_company_id').references(() => users.id),
  startDate: timestamp('start_date', { mode: 'date' }).notNull(),
  endDate: timestamp('end_date', { mode: 'date' }).notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Car = typeof cars.$inferSelect
export type Part = typeof parts.$inferSelect
export type User = typeof users.$inferSelect
