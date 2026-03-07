import { db } from "@/lib/db";
import { brandCampaigns } from "@/lib/db/schema";

const campaigns = [
	{
		brandName: "ProFit Nutrition",
		campaignTitle: "Campus Brand Ambassador",
		description:
			"Promote our pre-workout and protein line to your teammates and followers. Monthly stipend + product.",
		productCategory: "nutrition",
		budgetRange: "$300-$500/month",
		geographyStates: "ALL",
		sportPreferences: "ALL",
		divisionPreferences: "ALL",
	},
	{
		brandName: "GridironGear",
		campaignTitle: "Football Content Creator",
		description: "Post 2 TikToks/month featuring our cleats and training gear. Payment per post.",
		productCategory: "apparel",
		budgetRange: "$500-$1,000",
		geographyStates: "ALL",
		sportPreferences: "Football",
		divisionPreferences: "D1,D2",
	},
	{
		brandName: "Bay Area Sports Club",
		campaignTitle: "Local Athlete Partnership",
		description:
			"Appear in our monthly newsletter and one social post. Perfect for Bay Area college athletes.",
		productCategory: "local_business",
		budgetRange: "$200-$400",
		geographyStates: "CA",
		sportPreferences: "ALL",
		divisionPreferences: "ALL",
	},
	{
		brandName: "SwimFast Gear",
		campaignTitle: "Swimmer Brand Rep",
		description:
			"Wear our cap and goggles at meets and post meet-day content. Per-post compensation.",
		productCategory: "equipment",
		budgetRange: "$400-$800",
		geographyStates: "ALL",
		sportPreferences: "Swimming",
		divisionPreferences: "ALL",
	},
	{
		brandName: "Lone Star Eats",
		campaignTitle: "Texas Athlete Foodie",
		description: "Visit our Dallas/Houston locations and post a review. Texas athletes only.",
		productCategory: "food_beverage",
		budgetRange: "$150-$300 + free meals",
		geographyStates: "TX",
		sportPreferences: "ALL",
		divisionPreferences: "ALL",
	},
	{
		brandName: "HoopDreams Apparel",
		campaignTitle: "Basketball Ambassador",
		description:
			"Rock our streetwear collection in your off-court content. Season-long partnership.",
		productCategory: "apparel",
		budgetRange: "$600-$1,200",
		geographyStates: "ALL",
		sportPreferences: "Men's Basketball,Women's Basketball",
		divisionPreferences: "D1,D2,D3",
	},
	{
		brandName: "Sunshine Recovery",
		campaignTitle: "Recovery Athlete Spotlight",
		description:
			"Feature our CBD recovery balm in your post-workout routine. Florida athletes preferred.",
		productCategory: "health_wellness",
		budgetRange: "$250-$500",
		geographyStates: "FL,GA,SC",
		sportPreferences: "ALL",
		divisionPreferences: "ALL",
	},
	{
		brandName: "IronClad Training",
		campaignTitle: "Strength & Conditioning Partner",
		description: "Promote our gym membership app to your school community. Commission per signup.",
		productCategory: "fitness",
		budgetRange: "$10-$20/referral",
		geographyStates: "ALL",
		sportPreferences: "Football,Wrestling,Men's Basketball,Women's Basketball",
		divisionPreferences: "ALL",
	},
	{
		brandName: "Turf & Track",
		campaignTitle: "Multi-Sport Gear Review",
		description:
			"Review our training shoes across two Instagram posts. Open to all collegiate athletes.",
		productCategory: "equipment",
		budgetRange: "$300-$600 + gear",
		geographyStates: "ALL",
		sportPreferences: "ALL",
		divisionPreferences: "D1,D2,D3,NAIA",
	},
	{
		brandName: "Chicago Sports Network",
		campaignTitle: "Windy City Athlete Feature",
		description:
			"Be featured in our digital magazine and one sponsored social post. Illinois athletes only.",
		productCategory: "media",
		budgetRange: "$200-$350",
		geographyStates: "IL",
		sportPreferences: "ALL",
		divisionPreferences: "ALL",
	},
];

async function seed() {
	await db.insert(brandCampaigns).values(campaigns).onConflictDoNothing();
	console.log(`Seeded ${campaigns.length} brand campaigns`);
	process.exit(0);
}

seed().catch((e) => {
	console.error(e);
	process.exit(1);
});
