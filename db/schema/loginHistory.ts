import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { user } from './user';

export const loginHistory = pgTable('login_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => user.id),
  login_time: timestamp('login_time', { withTimezone: true }).defaultNow().notNull(),
  logout_time: timestamp('logout_time', { withTimezone: true }),
});

export type LoginHistory = typeof loginHistory.$inferSelect;
export type NewLoginHistory = typeof loginHistory.$inferInsert;
