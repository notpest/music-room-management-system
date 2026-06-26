import { pgTable, serial, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { band } from './band';
import { room } from './room';

export const slot = pgTable('slot', {
  id: serial('id').primaryKey(),
  status: varchar('status').notNull().default('available'),
  band_id: uuid('band_id').references(() => band.id),
  room_id: uuid('room_id').notNull().references(() => room.id),
  slot_start: timestamp('slot_start', { withTimezone: true }).notNull(),
  slot_end: timestamp('slot_end', { withTimezone: true }).notNull(),
}, (t) => ({
  roomTimeIdx: index('idx_slot_room_time').on(t.room_id, t.slot_start, t.slot_end),
}));

export type Slot = typeof slot.$inferSelect;
export type NewSlot = typeof slot.$inferInsert;
