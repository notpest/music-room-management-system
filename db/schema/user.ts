import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name').notNull(),
  hashed_password: varchar('hashed_password').notNull(),
  email: varchar('email').notNull().unique(),
  role: varchar('role').notNull().default('user'),
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
