import { relations } from "drizzle-orm";
import {
  date,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------- */
/*                                   Tables                                   */
/* -------------------------------------------------------------------------- */

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 120 }).notNull(),
  fullName: varchar("full_name", { length: 160 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const farms = pgTable(
  "farms",
  {
    id: serial("id").primaryKey(),
    ownerId: integer("owner_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    location: varchar("location", { length: 200 }),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("farms_owner_idx").on(table.ownerId)],
);

export const plots = pgTable(
  "plots",
  {
    id: serial("id").primaryKey(),
    farmId: integer("farm_id")
      .notNull()
      .references(() => farms.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    area: numeric("area", { precision: 10, scale: 2 }),
    areaUnit: varchar("area_unit", { length: 24 }).notNull().default("m2"),
    soilType: varchar("soil_type", { length: 80 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("plots_farm_idx").on(table.farmId)],
);

export const plantFamilies = pgTable("plant_families", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull().unique(),
  localName: varchar("local_name", { length: 120 }),
  description: text("description"),
  pestRisk: text("pest_risk"),
});

export const crops = pgTable(
  "crops",
  {
    id: serial("id").primaryKey(),
    commonName: varchar("common_name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    familyId: integer("family_id")
      .notNull()
      .references(() => plantFamilies.id, { onDelete: "cascade" }),
    /** "tinggi" | "sedang" | "rendah" */
    nutrientDemand: varchar("nutrient_demand", { length: 24 }).notNull().default("sedang"),
    /** "pembenah" | "netral" | "berat" */
    soilImpact: varchar("soil_impact", { length: 24 }).notNull().default("netral"),
    daysToHarvest: integer("days_to_harvest"),
    minPh: numeric("min_ph", { precision: 3, scale: 1 }),
    maxPh: numeric("max_ph", { precision: 3, scale: 1 }),
    emoji: varchar("emoji", { length: 12 }),
    description: text("description"),
  },
  (table) => [index("crops_family_idx").on(table.familyId)],
);

export const plantings = pgTable(
  "plantings",
  {
    id: serial("id").primaryKey(),
    plotId: integer("plot_id")
      .notNull()
      .references(() => plots.id, { onDelete: "cascade" }),
    cropId: integer("crop_id")
      .notNull()
      .references(() => crops.id, { onDelete: "cascade" }),
    plantedOn: date("planted_on").notNull(),
    harvestedOn: date("harvested_on"),
    /** "berjalan" | "panen" | "gagal" */
    status: varchar("status", { length: 24 }).notNull().default("berjalan"),
    yieldKg: numeric("yield_kg", { precision: 10, scale: 2 }),
    notes: text("notes"),
    pestNotes: text("pest_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("plantings_plot_idx").on(table.plotId)],
);

export const soilTests = pgTable(
  "soil_tests",
  {
    id: serial("id").primaryKey(),
    plotId: integer("plot_id")
      .notNull()
      .references(() => plots.id, { onDelete: "cascade" }),
    testedOn: date("tested_on").notNull(),
    ph: numeric("ph", { precision: 4, scale: 1 }).notNull(),
    /** ppm */
    n: numeric("n", { precision: 10, scale: 2 }),
    p: numeric("p", { precision: 10, scale: 2 }),
    k: numeric("k", { precision: 10, scale: 2 }),
    organicMatter: numeric("organic_matter", { precision: 6, scale: 2 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("soil_tests_plot_idx").on(table.plotId)],
);

/* -------------------------------------------------------------------------- */
/*                                  Relations                                 */
/* -------------------------------------------------------------------------- */

export const profilesRelations = relations(profiles, ({ many }) => ({
  farms: many(farms),
}));

export const farmsRelations = relations(farms, ({ one, many }) => ({
  owner: one(profiles, { fields: [farms.ownerId], references: [profiles.id] }),
  plots: many(plots),
}));

export const plotsRelations = relations(plots, ({ one, many }) => ({
  farm: one(farms, { fields: [plots.farmId], references: [farms.id] }),
  plantings: many(plantings),
  soilTests: many(soilTests),
}));

export const cropsRelations = relations(crops, ({ one }) => ({
  family: one(plantFamilies, {
    fields: [crops.familyId],
    references: [plantFamilies.id],
  }),
}));

export const plantingsRelations = relations(plantings, ({ one }) => ({
  plot: one(plots, { fields: [plantings.plotId], references: [plots.id] }),
  crop: one(crops, { fields: [plantings.cropId], references: [crops.id] }),
}));

export const soilTestsRelations = relations(soilTests, ({ one }) => ({
  plot: one(plots, { fields: [soilTests.plotId], references: [plots.id] }),
}));

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type Profile = typeof profiles.$inferSelect;
export type Farm = typeof farms.$inferSelect;
export type Plot = typeof plots.$inferSelect;
export type PlantFamily = typeof plantFamilies.$inferSelect;
export type Crop = typeof crops.$inferSelect;
export type Planting = typeof plantings.$inferSelect;
export type SoilTest = typeof soilTests.$inferSelect;

export type NewFarm = typeof farms.$inferInsert;
export type NewPlot = typeof plots.$inferInsert;
export type NewCrop = typeof crops.$inferInsert;
export type NewPlanting = typeof plantings.$inferInsert;
export type NewSoilTest = typeof soilTests.$inferInsert;
