import type { InferSelectModel } from "drizzle-orm";
import type {
	athleteProfiles,
	brandCampaigns,
	contractReviews,
	dealApplications,
	profiles,
} from "@/lib/db/schema";

export type Profile = InferSelectModel<typeof profiles>;
export type AthleteProfile = InferSelectModel<typeof athleteProfiles>;
export type ContractReview = InferSelectModel<typeof contractReviews>;
export type BrandCampaign = InferSelectModel<typeof brandCampaigns>;
export type DealApplication = InferSelectModel<typeof dealApplications>;
