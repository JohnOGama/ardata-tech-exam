CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address" varchar(42) NOT NULL,
	"balance" numeric(18, 8) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
