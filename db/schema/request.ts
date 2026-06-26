import { pgTable, uuid, varchar, timestamp, integer, text, index } from 'drizzle-orm/pg-core';
import { user } from './user';
import { band } from './band';
import { room } from './room';
import { slot } from './slot';

export const request = pgTable('request', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => user.id),
  status: varchar('status').notNull(),
  slot_start: timestamp('slot_start', { withTimezone: true }).notNull(),
  slot_end: timestamp('slot_end', { withTimezone: true }).notNull(),
  request_date: timestamp('request_date', { withTimezone: true }).defaultNow().notNull(),
  response_date: timestamp('response_date', { withTimezone: true }),
  slot_id: integer('slot_id').references(() => slot.id),
  room_id: uuid('room_id').notNull().references(() => room.id),
  band_id: uuid('band_id').references(() => band.id),
  reason: text('reason'),
}, (t) => ({
  roomTimeIdx: index('idx_request_room_time').on(t.room_id, t.slot_start, t.slot_end),
}));

export type Request = typeof request.$inferSelect;
export type NewRequest = typeof request.$inferInsert;
