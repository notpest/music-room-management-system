import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

export const equipment = pgTable('equipment', {
  id: uuid('id').defaultRandom().primaryKey(),
  equipment_name: varchar('equipment_name').notNull(),
  category: varchar('category').notNull(),
  quantity: integer('quantity').notNull(),
  created_date: timestamp('created_date', { withTimezone: true }).defaultNow().notNull(),
});

export type Equipment = typeof equipment.$inferSelect;
export type NewEquipment = typeof equipment.$inferInsert;
