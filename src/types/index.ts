import type { InferSelectModel } from "drizzle-orm";
import type { athleteProfiles, contractReviews, profiles } from "@/lib/db/schema";

export type Profile = InferSelectModel<typeof profiles>;
export type AthleteProfile = InferSelectModel<typeof athleteProfiles>;
export type ContractReview = InferSelectModel<typeof contractReviews>;
