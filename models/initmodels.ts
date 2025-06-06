// models/initModels.ts
// ─────────────────────────────────────────────────────────────────────────────
// Its only job is to import every model (so that Model.init(...) runs), then
// call applyAssociations() exactly once.
// ─────────────────────────────────────────────────────────────────────────────

import "./User";       // ensures User.init(...) has been called
import "./Band";       // ensures Band.init(...) has been called
import "./UserBand";   // ensures UserBand.init(...) has been called

import { applyAssociations } from "./associations";
applyAssociations();

// We don’t need to export anything from here.  The side‐effect of importing
// User/Band/UserBand + running applyAssociations() is exactly what we wanted.
