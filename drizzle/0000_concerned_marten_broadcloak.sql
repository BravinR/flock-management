CREATE TYPE "public"."feed_input_mode" AS ENUM('bags', 'kg');--> statement-breakpoint
CREATE TYPE "public"."feed_type" AS ENUM('Starters Mash', 'Growers Mash', 'Layers Mash', 'Finisher Mash', 'Other');--> statement-breakpoint
CREATE TYPE "public"."vaccine_status" AS ENUM('pending', 'completed', 'overdue', 'upcoming');--> statement-breakpoint
CREATE TABLE "poultry_feed_intakes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "poultry_feed_intakes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"delivery_date" timestamp NOT NULL,
	"feed_type" "feed_type" NOT NULL,
	"custom_feed_name" varchar(255),
	"supplier_id" integer,
	"supplier_name" varchar(255),
	"input_mode" "feed_input_mode" NOT NULL,
	"bags_received" integer,
	"kg_received" numeric(10, 2),
	"cost_per_bag" numeric(10, 2),
	"cost_per_kg" numeric(10, 2),
	"total_cost" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'KES' NOT NULL,
	"batch_number" varchar(100),
	"invoice_number" varchar(100),
	"notes" text,
	"received_by" varchar(255) NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poultry_suppliers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "poultry_suppliers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"contact_person" varchar(255),
	"phone" varchar(50),
	"email" varchar(255),
	"address" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poultry_users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "poultry_users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'user',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "poultry_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "poultry_vaccine_administrations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "poultry_vaccine_administrations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"schedule_id" integer NOT NULL,
	"administration_date" timestamp NOT NULL,
	"full_flock_vaccinated" boolean DEFAULT true NOT NULL,
	"head_count_vaccinated" integer,
	"cost" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'KES' NOT NULL,
	"notes" text,
	"administered_by" varchar(255) NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poultry_vaccine_schedules" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "poultry_vaccine_schedules_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"vaccine_name" varchar(255) NOT NULL,
	"week_number" integer NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"status" "vaccine_status" DEFAULT 'pending' NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "poultry_feed_intakes" ADD CONSTRAINT "poultry_feed_intakes_supplier_id_poultry_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."poultry_suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_feed_intakes" ADD CONSTRAINT "poultry_feed_intakes_created_by_poultry_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."poultry_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_vaccine_administrations" ADD CONSTRAINT "poultry_vaccine_administrations_schedule_id_poultry_vaccine_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."poultry_vaccine_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_vaccine_administrations" ADD CONSTRAINT "poultry_vaccine_administrations_created_by_poultry_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."poultry_users"("id") ON DELETE no action ON UPDATE no action;