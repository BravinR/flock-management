CREATE TABLE "poultry_daily_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "poultry_daily_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"batch_id" integer,
	"log_date" timestamp NOT NULL,
	"mortality_count" integer DEFAULT 0 NOT NULL,
	"feed_type" "feed_type" NOT NULL,
	"feed_input_mode" "feed_input_mode" NOT NULL,
	"feed_bags" numeric(10, 2) DEFAULT '0',
	"feed_kg" numeric(10, 2) DEFAULT '0',
	"water_intake_liters" numeric(10, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"logged_by" varchar(255) NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "poultry_daily_logs" ADD CONSTRAINT "poultry_daily_logs_batch_id_poultry_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."poultry_batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poultry_daily_logs" ADD CONSTRAINT "poultry_daily_logs_created_by_poultry_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."poultry_users"("id") ON DELETE no action ON UPDATE no action;