// models/associations.ts
import User from "./User";
import Band from "./Band";
import UserBand from "./UserBand";
import Room from "./Room";
import Slot from "./Slot";
import Request from "./Request";
import EntryLog from "./EntryLog";
import Equipment from "./Equipment";
import LoginHistory from "./LoginHistory";

export function applyAssociations() {
  // --- User & Band (Many-to-Many) ---
  User.belongsToMany(Band, {
    through: UserBand,
    foreignKey: "user_id",
    otherKey: "band_id",
    as: "Bands",
  });

  Band.belongsToMany(User, {
    through: UserBand,
    foreignKey: "band_id",
    otherKey: "user_id",
    as: "Users",
  });

  // --- Request ---
  Request.belongsTo(User, { foreignKey: "user_id" });
  Request.belongsTo(Band, { foreignKey: "band_id" });
  Request.belongsTo(Room, { foreignKey: "room_id" });
  Request.belongsTo(Slot, { foreignKey: "slot_id" });

  User.hasMany(Request, { foreignKey: "user_id" });
  Band.hasMany(Request, { foreignKey: "band_id" });
  Room.hasMany(Request, { foreignKey: "room_id" });
  Slot.hasOne(Request, { foreignKey: "slot_id" });

  // --- Slot ---
  Slot.belongsTo(Band, { foreignKey: "band_id" });
  Slot.belongsTo(Room, { foreignKey: "room_id" });

  Band.hasMany(Slot, { foreignKey: "band_id" });
  Room.hasMany(Slot, { foreignKey: "room_id" });

  // --- EntryLog & Equipment ---
  EntryLog.belongsTo(Equipment, { foreignKey: "equipment_id", targetKey: "id" });
  Equipment.hasMany(EntryLog, { foreignKey: "equipment_id", sourceKey: "id" });

  // --- LoginHistory ---
  LoginHistory.belongsTo(User, { foreignKey: "user_id" });
  User.hasMany(LoginHistory, { foreignKey: "user_id" });
}
