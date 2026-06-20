// models/initModels.ts
// ─────────────────────────────────────────────────────────────────────────────
// Its only job is to import every model (so that Model.init(...) runs), then
// call applyAssociations() exactly once.
// ─────────────────────────────────────────────────────────────────────────────

import "./User";
import "./Band";
import "./UserBand";
import "./Room";
import "./Slot";
import "./Request";
import "./EntryLog";
import "./Equipment";
import "./SlotConfig";
import "./LoginHistory";

import { applyAssociations } from "./associations";
applyAssociations();

// We don’t need to export anything from here. The side-effect of importing
// these models + running applyAssociations() is exactly what we wanted.
