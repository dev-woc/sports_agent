import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const { data: session } = await auth.getSession();
	if (!session?.user) redirect("/login");

	return (
		<div className="min-h-screen flex flex-col">
			<header className="border-b bg-card">
				<div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3">
					<nav className="flex items-center gap-4">
						<Link href="/editor" className="text-sm font-medium hover:text-primary">
							Editor
						</Link>
					</nav>
					<div className="flex items-center gap-4">
						<span className="text-sm text-muted-foreground">{session.user.email}</span>
					</div>
				</div>
			</header>
			<main className="flex-1">{children}</main>
		</div>
	);
}
