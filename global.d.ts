import { Pool } from "pg";

declare global {
  var __dbPool: Pool | undefined;
}
