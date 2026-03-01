import type { InferSelectModel } from "drizzle-orm";
import type { athleteProfiles, clickEvents, linkItems, profiles } from "@/lib/db/schema";

export type Profile = InferSelectModel<typeof profiles>;
export type LinkItem = InferSelectModel<typeof linkItems>;
export type ClickEvent = InferSelectModel<typeof clickEvents>;
export type AthleteProfile = InferSelectModel<typeof athleteProfiles>;

export type LinkItemType = "link" | "header" | "divider";
export type Theme = "minimal" | "dark" | "colorful" | "professional";

export interface ProfileWithLinks {
	profile: Profile;
	links: LinkItem[];
}

export interface EditorState {
	displayName: string;
	bio: string;
	avatarUrl: string;
	theme: Theme;
	links: LinkItem[];
	isDirty: boolean;
	isSaving: boolean;
}

export interface ThemeProps {
	displayName: string;
	bio: string;
	avatarUrl: string;
	links: Array<{
		id: string;
		type: "link" | "header" | "divider";
		title: string;
		url: string;
	}>;
	isPreview?: boolean;
}
