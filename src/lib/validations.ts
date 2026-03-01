import { z } from "zod";

export const RESERVED_SLUGS = [
	"login",
	"signup",
	"editor",
	"analytics",
	"settings",
	"api",
	"admin",
	"about",
	"help",
	"support",
	"terms",
	"privacy",
	"auth",
	"dashboard",
	"account",
	"profile",
	"public",
	"static",
	"assets",
	"images",
	"favicon",
];

export const slugSchema = z
	.string()
	.min(3, "Username must be at least 3 characters")
	.max(30, "Username must be at most 30 characters")
	.regex(
		/^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
		"Username must be lowercase alphanumeric with hyphens, cannot start or end with a hyphen",
	)
	.refine((val) => !RESERVED_SLUGS.includes(val), "This username is reserved");

export const profileSchema = z.object({
	displayName: z.string().max(50, "Name must be at most 50 characters"),
	bio: z.string().max(160, "Bio must be at most 160 characters"),
	avatarUrl: z.string().url("Must be a valid URL").or(z.literal("")),
	theme: z.enum(["minimal", "dark", "colorful", "professional"]),
});

export const linkItemSchema = z
	.object({
		type: z.enum(["link", "header", "divider"]),
		title: z.string().max(100).optional(),
		url: z.string().url("Must be a valid URL").optional(),
	})
	.refine(
		(data) => {
			if (data.type === "link") return !!data.title && !!data.url;
			if (data.type === "header") return !!data.title;
			return true;
		},
		{ message: "Links require title and URL; headers require title" },
	);

export const reorderSchema = z.object({
	items: z.array(
		z.object({
			id: z.string().uuid(),
			sortOrder: z.number().int().nonnegative(),
		}),
	),
});

export const slugCheckSchema = z.object({
	slug: z.string().min(1),
});

export const DIVISIONS = ["D1", "D2", "D3", "NAIA", "NJCAA", "High School"] as const;
export type Division = (typeof DIVISIONS)[number];

export const athleteProfileSchema = z.object({
	sport: z.string().min(1, "Sport is required"),
	position: z.string().optional().default(""),
	school: z.string().min(1, "School is required").max(100, "School name too long"),
	division: z.enum(DIVISIONS, { message: "Invalid division" }),
	state: z.string().length(2, "Must be a valid 2-letter state code"),
	gradYear: z.number().int().min(2025).max(2032),
	eligibilityStatus: z.string().min(1, "Eligibility status is required"),
	nilEligible: z.boolean().optional().default(false),
	socialInstagram: z.string().optional().default(""),
	socialTiktok: z.string().optional().default(""),
	socialTwitter: z.string().optional().default(""),
});
