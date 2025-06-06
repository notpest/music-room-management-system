// models/associations.ts
import User from "./User";
import Band from "./Band";
import UserBand from "./UserBand";

export function applyAssociations() {
  // A user can belong to many bands...
  User.belongsToMany(Band, {
    through: UserBand,
    foreignKey: "user_id",
    otherKey: "band_id",
  });

  // …and a band can have many users.
  Band.belongsToMany(User, {
    through: UserBand,
    foreignKey: "band_id",
    otherKey: "user_id",
  });
}
