import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const band = pgTable('band', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name').notNull(),
  created_date: timestamp('created_date', { withTimezone: true }).defaultNow().notNull(),
  colour: varchar('colour').notNull(),
});

export type Band = typeof band.$inferSelect;
export type NewBand = typeof band.$inferInsert;
