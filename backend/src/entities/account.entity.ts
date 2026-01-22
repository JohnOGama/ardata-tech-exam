import {
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
} from 'drizzle-orm/pg-core';

export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  address: varchar('address', { length: 42 }).notNull(),
  balance: numeric('balance', { precision: 18, scale: 8 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
