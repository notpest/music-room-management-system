import { pgTable, uuid, integer, varchar } from 'drizzle-orm/pg-core';

export const room = pgTable('room', {
  id: uuid('id').defaultRandom().primaryKey(),
  number: integer('number').notNull().unique(),
  name: varchar('name').notNull(),
});

export type Room = typeof room.$inferSelect;
export type NewRoom = typeof room.$inferInsert;
