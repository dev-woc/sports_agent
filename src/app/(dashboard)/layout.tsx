import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const { data: session } = await auth.getSession();
	if (!session?.user) redirect("/login");

	const initials = session.user.email?.slice(0, 2).toUpperCase() ?? "??";

	return (
		<div className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
					<div className="flex items-center gap-8">
						<Link
							href="/"
							className="text-base font-bold tracking-tight transition-opacity hover:opacity-80"
						>
							Athlete OS
						</Link>
						<nav className="hidden items-center gap-6 text-sm sm:flex">
							<Link href="/contracts" className="font-medium transition-colors hover:text-primary">
								Contract Guard
							</Link>
						</nav>
					</div>
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
							{initials}
						</div>
					</div>
				</div>
			</header>
			<main className="flex-1">{children}</main>
		</div>
	);
}
