CREATE TABLE "bus_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"line_number" text NOT NULL,
	"name" text,
	"color" text DEFAULT '#000000',
	"main_attractions" text
);
--> statement-breakpoint
CREATE TABLE "bus_route_stops" (
	"id" serial PRIMARY KEY NOT NULL,
	"line_id" integer,
	"stop_id" integer,
	"order" integer,
	"direction" text
);
--> statement-breakpoint
CREATE TABLE "bus_stops" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"is_hub" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "bus_route_stops" ADD CONSTRAINT "bus_route_stops_line_id_bus_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."bus_lines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bus_route_stops" ADD CONSTRAINT "bus_route_stops_stop_id_bus_stops_id_fk" FOREIGN KEY ("stop_id") REFERENCES "public"."bus_stops"("id") ON DELETE no action ON UPDATE no action;