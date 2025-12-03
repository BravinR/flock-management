CREATE TYPE "public"."breed" AS ENUM('Layers', 'Broilers', 'Kenbro');--> statement-breakpoint
CREATE TABLE "poultry_batches" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "poultry_batches_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"batch_id" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"supplier" varchar(255) NOT NULL,
	"breed" "breed" NOT NULL,
	"arrival_date" timestamp NOT NULL,
	"intake_age_days" integer NOT NULL,
	"initial_quantity" integer NOT NULL,
	"current_count" integer NOT NULL,
	"cost_per_bird" numeric(10, 2) NOT NULL,
	"transport_cost" numeric(10, 2) NOT NULL,
	"equipment_cost" numeric(10, 2) NOT NULL,
	"total_initial_cost" numeric(10, 2) NOT NULL,
	"amount_paid_upfront" numeric(10, 2) NOT NULL,
	"balance_due" numeric(10, 2) NOT NULL,
	"payment_status" varchar(20) NOT NULL,
	"currency" varchar(10) DEFAULT 'KES' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "poultry_batches_batch_id_unique" UNIQUE("batch_id")
);
--> statement-breakpoint
CREATE TABLE "poultry_coop_allocations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "poultry_coop_allocations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"batch_id" integer NOT NULL,
	"coop_id" varchar(100) NOT NULL,
	"allocated_quantity" integer NOT NULL,
	"placement_date" timestamp NOT NULL,
	"notes" text,
	"initial_mortality" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "poultry_coop_allocations" ADD CONSTRAINT "poultry_coop_allocations_batch_id_poultry_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."poultry_batches"("id") ON DELETE cascade ON UPDATE no action;