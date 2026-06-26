import { relations } from 'drizzle-orm';
import { user } from './user';
import { band } from './band';
import { userBand } from './userBand';
import { room } from './room';
import { slot } from './slot';
import { request } from './request';
import { equipment } from './equipment';
import { entryLog } from './entryLog';
import { loginHistory } from './loginHistory';

export const userRelations = relations(user, ({ many }) => ({
  userBands: many(userBand),
  requests: many(request),
  loginHistories: many(loginHistory),
}));

export const bandRelations = relations(band, ({ many }) => ({
  userBands: many(userBand),
  requests: many(request),
  slots: many(slot),
}));

export const userBandRelations = relations(userBand, ({ one }) => ({
  user: one(user, { fields: [userBand.user_id], references: [user.id] }),
  band: one(band, { fields: [userBand.band_id], references: [band.id] }),
}));

export const roomRelations = relations(room, ({ many }) => ({
  slots: many(slot),
  requests: many(request),
}));

export const slotRelations = relations(slot, ({ one }) => ({
  band: one(band, { fields: [slot.band_id], references: [band.id] }),
  room: one(room, { fields: [slot.room_id], references: [room.id] }),
  request: one(request, { fields: [slot.id], references: [request.slot_id] }),
}));

export const requestRelations = relations(request, ({ one }) => ({
  user: one(user, { fields: [request.user_id], references: [user.id] }),
  band: one(band, { fields: [request.band_id], references: [band.id] }),
  room: one(room, { fields: [request.room_id], references: [room.id] }),
  slot: one(slot, { fields: [request.slot_id], references: [slot.id] }),
}));

export const equipmentRelations = relations(equipment, ({ many }) => ({
  entryLogs: many(entryLog),
}));

export const entryLogRelations = relations(entryLog, ({ one }) => ({
  equipment: one(equipment, { fields: [entryLog.equipment_id], references: [equipment.id] }),
}));

export const loginHistoryRelations = relations(loginHistory, ({ one }) => ({
  user: one(user, { fields: [loginHistory.user_id], references: [user.id] }),
}));
