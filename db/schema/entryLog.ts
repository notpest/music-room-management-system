import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const entryLog = pgTable('entry_log', {
  id: serial('id').primaryKey(),
  equipment_id: varchar('equipment_id').notNull(),
  scanned_at: timestamp('scanned_at', { withTimezone: true }).notNull(),
});

export type EntryLog = typeof entryLog.$inferSelect;
export type NewEntryLog = typeof entryLog.$inferInsert;
