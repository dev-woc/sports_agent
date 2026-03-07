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
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("idx_profiles_slug").on(table.slug),
		index("idx_profiles_user_id").on(table.userId),
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

export const contractReviews = pgTable(
	"contract_reviews",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		profileId: uuid("profile_id")
			.notNull()
			.references(() => profiles.id, { onDelete: "cascade" }),
		fileName: text("file_name").notNull().default(""),
		rawText: text("raw_text").notNull().default(""),
		analysisJson: text("analysis_json").notNull().default("{}"),
		overallRisk: text("overall_risk").notNull().default("unknown"),
		flagCount: integer("flag_count").notNull().default(0),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(t) => [index("idx_contract_reviews_profile_id").on(t.profileId)],
);

export const brandCampaigns = pgTable(
	"brand_campaigns",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		brandName: text("brand_name").notNull(),
		campaignTitle: text("campaign_title").notNull(),
		description: text("description").notNull().default(""),
		productCategory: text("product_category").notNull(),
		budgetRange: text("budget_range").notNull().default(""),
		geographyStates: text("geography_states").notNull().default("ALL"),
		sportPreferences: text("sport_preferences").notNull().default("ALL"),
		divisionPreferences: text("division_preferences").notNull().default("ALL"),
		isActive: boolean("is_active").notNull().default(true),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(t) => [index("idx_brand_campaigns_is_active").on(t.isActive)],
);

export const dealApplications = pgTable(
	"deal_applications",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		campaignId: uuid("campaign_id")
			.notNull()
			.references(() => brandCampaigns.id, { onDelete: "cascade" }),
		profileId: uuid("profile_id")
			.notNull()
			.references(() => profiles.id, { onDelete: "cascade" }),
		status: text("status").notNull().default("pending"),
		matchScore: integer("match_score").notNull().default(0),
		matchReasons: text("match_reasons").notNull().default("[]"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(t) => [
		index("idx_deal_applications_profile_id").on(t.profileId),
		index("idx_deal_applications_campaign_id").on(t.campaignId),
		uniqueIndex("idx_deal_applications_unique").on(t.campaignId, t.profileId),
	],
);

export const profilesRelations = relations(profiles, ({ one, many }) => ({
	athleteProfile: one(athleteProfiles),
	contractReviews: many(contractReviews),
}));

export const athleteProfilesRelations = relations(athleteProfiles, ({ one }) => ({
	profile: one(profiles, {
		fields: [athleteProfiles.profileId],
		references: [profiles.id],
	}),
}));

export const contractReviewsRelations = relations(contractReviews, ({ one }) => ({
	profile: one(profiles, { fields: [contractReviews.profileId], references: [profiles.id] }),
}));

export const brandCampaignsRelations = relations(brandCampaigns, ({ many }) => ({
	applications: many(dealApplications),
}));

export const dealApplicationsRelations = relations(dealApplications, ({ one }) => ({
	campaign: one(brandCampaigns, {
		fields: [dealApplications.campaignId],
		references: [brandCampaigns.id],
	}),
	profile: one(profiles, { fields: [dealApplications.profileId], references: [profiles.id] }),
}));
