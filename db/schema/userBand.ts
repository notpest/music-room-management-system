import { pgTable, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { user } from './user';
import { band } from './band';

export const userBand = pgTable('UserBand', {
  user_id: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  band_id: uuid('band_id').notNull().references(() => band.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.user_id, t.band_id] }),
}));

export type UserBand = typeof userBand.$inferSelect;
export type NewUserBand = typeof userBand.$inferInsert;
