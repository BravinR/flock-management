import {
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const vaccineStatusEnum = pgEnum("vaccine_status", [
  "pending",
  "completed",
  "overdue",
  "upcoming",
]);

export const feedTypeEnum = pgEnum("feed_type", [
  "Starters Mash",
  "Growers Mash",
  "Layers Mash",
  "Finisher Mash",
  "Other",
]);

export const feedInputModeEnum = pgEnum("feed_input_mode", ["bags", "kg"]);

export const breedEnum = pgEnum("breed", ["Layers", "Broilers", "Kenbro"]);

// Daily Logs Table
export const dailyLogsTable = pgTable("poultry_daily_logs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  batchId: integer("batch_id").references(() => batchesTable.id, {
    onDelete: "cascade",
  }),
  logDate: timestamp("log_date").notNull(),
  mortalityCount: integer("mortality_count").default(0).notNull(),
  feedType: feedTypeEnum("feed_type").notNull(),
  feedInputMode: feedInputModeEnum("feed_input_mode").notNull(),
  feedBags: decimal("feed_bags", { precision: 10, scale: 2 }).default("0"),
  feedKg: decimal("feed_kg", { precision: 10, scale: 2 }).default("0"),
  waterIntakeLiters: decimal("water_intake_liters", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  notes: text(),
  loggedBy: varchar("logged_by", { length: 255 }).notNull(),
  createdBy: integer("created_by").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Batches Table
export const batchesTable = pgTable("poultry_batches", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  batchId: varchar("batch_id", { length: 100 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  supplier: varchar({ length: 255 }).notNull(),
  breed: breedEnum().notNull(),
  arrivalDate: timestamp("arrival_date").notNull(),
  intakeAgeDays: integer("intake_age_days").notNull(),
  initialQuantity: integer("initial_quantity").notNull(),
  currentCount: integer("current_count").notNull(),
  // Cost data
  costPerBird: decimal("cost_per_bird", { precision: 10, scale: 2 }).notNull(),
  transportCost: decimal("transport_cost", { precision: 10, scale: 2 }).notNull(),
  equipmentCost: decimal("equipment_cost", { precision: 10, scale: 2 }).notNull(),
  totalInitialCost: decimal("total_initial_cost", { precision: 10, scale: 2 }).notNull(),
  amountPaidUpfront: decimal("amount_paid_upfront", { precision: 10, scale: 2 }).notNull(),
  balanceDue: decimal("balance_due", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: varchar("payment_status", { length: 20 }).notNull(),
  currency: varchar({ length: 10 }).default("KES").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Coop Allocations Table
export const coopAllocationsTable = pgTable("poultry_coop_allocations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  batchId: integer("batch_id")
    .notNull()
    .references(() => batchesTable.id, { onDelete: "cascade" }),
  coopId: varchar("coop_id", { length: 100 }).notNull(),
  allocatedQuantity: integer("allocated_quantity").notNull(),
  placementDate: timestamp("placement_date").notNull(),
  notes: text(),
  initialMortality: integer("initial_mortality").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users Table
export const usersTable = pgTable("poultry_users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  role: varchar({ length: 50 }).default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Suppliers Table
export const suppliersTable = pgTable("poultry_suppliers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar({ length: 50 }),
  email: varchar({ length: 255 }),
  address: text(),
  notes: text(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vaccine Schedules Table
export const vaccineSchedulesTable = pgTable("poultry_vaccine_schedules", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  vaccineName: varchar("vaccine_name", { length: 255 }).notNull(),
  weekNumber: integer("week_number").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: vaccineStatusEnum().default("pending").notNull(),
  description: text(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vaccine Administrations Table
export const vaccineAdministrationsTable = pgTable("poultry_vaccine_administrations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  scheduleId: integer("schedule_id")
    .notNull()
    .references(() => vaccineSchedulesTable.id, { onDelete: "cascade" }),
  administrationDate: timestamp("administration_date").notNull(),
  fullFlockVaccinated: boolean("full_flock_vaccinated")
    .default(true)
    .notNull(),
  headCountVaccinated: integer("head_count_vaccinated"),
  cost: decimal({ precision: 10, scale: 2 }).notNull(),
  currency: varchar({ length: 10 }).default("KES").notNull(),
  notes: text(),
  administeredBy: varchar("administered_by", { length: 255 }).notNull(),
  createdBy: integer("created_by").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Feed Intakes Table
export const feedIntakesTable = pgTable("poultry_feed_intakes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deliveryDate: timestamp("delivery_date").notNull(),
  feedType: feedTypeEnum("feed_type").notNull(),
  customFeedName: varchar("custom_feed_name", { length: 255 }),
  supplierId: integer("supplier_id").references(() => suppliersTable.id),
  supplierName: varchar("supplier_name", { length: 255 }),
  inputMode: feedInputModeEnum("input_mode").notNull(),
  bagsReceived: integer("bags_received"),
  kgReceived: decimal("kg_received", { precision: 10, scale: 2 }),
  costPerBag: decimal("cost_per_bag", { precision: 10, scale: 2 }),
  costPerKg: decimal("cost_per_kg", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  currency: varchar({ length: 10 }).default("KES").notNull(),
  batchNumber: varchar("batch_number", { length: 100 }),
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  notes: text(),
  receivedBy: varchar("received_by", { length: 255 }).notNull(),
  createdBy: integer("created_by").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const vaccineSchedulesRelations = relations(
  vaccineSchedulesTable,
  ({ many }) => ({
    administrations: many(vaccineAdministrationsTable),
  })
);

export const vaccineAdministrationsRelations = relations(
  vaccineAdministrationsTable,
  ({ one }) => ({
    schedule: one(vaccineSchedulesTable, {
      fields: [vaccineAdministrationsTable.scheduleId],
      references: [vaccineSchedulesTable.id],
    }),
    createdByUser: one(usersTable, {
      fields: [vaccineAdministrationsTable.createdBy],
      references: [usersTable.id],
    }),
  })
);

export const feedIntakesRelations = relations(feedIntakesTable, ({ one }) => ({
  supplier: one(suppliersTable, {
    fields: [feedIntakesTable.supplierId],
    references: [suppliersTable.id],
  }),
  createdByUser: one(usersTable, {
    fields: [feedIntakesTable.createdBy],
    references: [usersTable.id],
  }),
}));

export const suppliersRelations = relations(suppliersTable, ({ many }) => ({
  feedIntakes: many(feedIntakesTable),
}));

export const usersRelations = relations(usersTable, ({ many }) => ({
  vaccineAdministrations: many(vaccineAdministrationsTable),
  feedIntakes: many(feedIntakesTable),
}));

export const batchesRelations = relations(batchesTable, ({ many }) => ({
  coopAllocations: many(coopAllocationsTable),
  dailyLogs: many(dailyLogsTable),
}));

export const coopAllocationsRelations = relations(
  coopAllocationsTable,
  ({ one }) => ({
    batch: one(batchesTable, {
      fields: [coopAllocationsTable.batchId],
      references: [batchesTable.id],
    }),
  })
);

export const dailyLogsRelations = relations(dailyLogsTable, ({ one }) => ({
  batch: one(batchesTable, {
    fields: [dailyLogsTable.batchId],
    references: [batchesTable.id],
  }),
  createdByUser: one(usersTable, {
    fields: [dailyLogsTable.createdBy],
    references: [usersTable.id],
  }),
}));
