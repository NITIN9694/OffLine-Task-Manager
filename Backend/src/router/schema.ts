import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    createAt: timestamp("created_at").defaultNow(),
    updateAt: timestamp("update_at").defaultNow()
})

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;