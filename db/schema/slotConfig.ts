import { pgTable, uuid, time, boolean } from 'drizzle-orm/pg-core';

export const slotConfig = pgTable('slot_config', {
  id: uuid('id').defaultRandom().primaryKey(),
  start_time: time('start_time').notNull(),
  end_time: time('end_time').notNull(),
  enabled: boolean('enabled').notNull().default(true),
});

export type SlotConfig = typeof slotConfig.$inferSelect;
export type NewSlotConfig = typeof slotConfig.$inferInsert;
