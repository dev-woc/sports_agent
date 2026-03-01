import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

export const profiles = pgTable(
	"profiles",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: text("user_id").notNull().unique(),
		slug: text("slug").notNull().unique(),
		displayName: text("display_name").notNull().default(""),
		bio: text("bio").notNull().default(""),
		avatarUrl: text("avatar_url").notNull().default(""),
		theme: text("theme").notNull().default("minimal"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("idx_profiles_slug").on(table.slug),
		index("idx_profiles_user_id").on(table.userId),
	],
);

export const linkItems = pgTable(
	"link_items",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		profileId: uuid("profile_id")
			.notNull()
			.references(() => profiles.id, { onDelete: "cascade" }),
		type: text("type").notNull().default("link"),
		title: text("title").notNull().default(""),
		url: text("url").notNull().default(""),
		sortOrder: integer("sort_order").notNull().default(0),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [index("idx_link_items_profile_id").on(table.profileId)],
);

export const clickEvents = pgTable(
	"click_events",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		linkItemId: uuid("link_item_id")
			.notNull()
			.references(() => linkItems.id, { onDelete: "cascade" }),
		clickedAt: timestamp("clicked_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("idx_click_events_link_item_id").on(table.linkItemId),
		index("idx_click_events_clicked_at").on(table.clickedAt),
	],
);

export const athleteProfiles = pgTable(
	"athlete_profiles",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		profileId: uuid("profile_id")
			.notNull()
			.unique()
			.references(() => profiles.id, { onDelete: "cascade" }),
		sport: text("sport").notNull(),
		position: text("position").notNull().default(""),
		school: text("school").notNull(),
		division: text("division").notNull(),
		state: text("state").notNull(),
		gradYear: integer("grad_year").notNull(),
		eligibilityStatus: text("eligibility_status").notNull(),
		nilEligible: boolean("nil_eligible").notNull().default(false),
		socialInstagram: text("social_instagram").notNull().default(""),
		socialTiktok: text("social_tiktok").notNull().default(""),
		socialTwitter: text("social_twitter").notNull().default(""),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(t) => [uniqueIndex("idx_athlete_profiles_profile_id").on(t.profileId)],
);

export const profilesRelations = relations(profiles, ({ one, many }) => ({
	linkItems: many(linkItems),
	athleteProfile: one(athleteProfiles),
}));

export const athleteProfilesRelations = relations(athleteProfiles, ({ one }) => ({
	profile: one(profiles, {
		fields: [athleteProfiles.profileId],
		references: [profiles.id],
	}),
}));

export const linkItemsRelations = relations(linkItems, ({ one, many }) => ({
	profile: one(profiles, { fields: [linkItems.profileId], references: [profiles.id] }),
	clickEvents: many(clickEvents),
}));

export const clickEventsRelations = relations(clickEvents, ({ one }) => ({
	linkItem: one(linkItems, { fields: [clickEvents.linkItemId], references: [linkItems.id] }),
}));
