import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
	const { data: session } = await auth.getSession();
	if (!session?.user) redirect("/login");

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			{children}
		</div>
	);
}
