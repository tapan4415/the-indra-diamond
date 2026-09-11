import { integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const resetState = sqliteTable("reset_state", {
  id: integer("id").primaryKey(),
  generation: integer("generation").notNull().default(0),
});
