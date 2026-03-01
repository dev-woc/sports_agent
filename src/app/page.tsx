import { ArrowRight, Handshake, ShieldCheck, UserCircle, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
	{
		icon: ShieldCheck,
		title: "Contract Guard",
		description:
			"AI flags predatory clauses, perpetuity terms, and exclusivity traps before you sign.",
	},
	{
		icon: Handshake,
		title: "NIL Matchmaker",
		description: "Match with brands aligned to your sport, audience, and compliance status.",
	},
	{
		icon: Users,
		title: "Parent Dashboard",
		description:
			"Unified recruiting timeline, NIL opportunities, and eligibility tracking for your family.",
	},
	{
		icon: UserCircle,
		title: "Athlete Profile",
		description: "A professional public profile with stats, highlights, and social links.",
	},
];

export default function Home() {
	return (
		<div className="flex min-h-screen flex-col">
			{/* Nav */}
			<header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
					<Link href="/" className="text-base font-bold tracking-tight">
						Athlete OS
					</Link>
					<nav className="flex items-center gap-3">
						<Button asChild variant="ghost" size="sm">
							<Link href="/login">Sign In</Link>
						</Button>
						<Button asChild size="sm">
							<Link href="/signup">Get Started</Link>
						</Button>
					</nav>
				</div>
			</header>

			{/* Hero */}
			<section className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-4 pb-24 pt-16 text-center">
				<h1 className="text-display max-w-3xl">
					Your Athletic Career,
					<br />
					One Platform.
				</h1>
				<p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
					NIL matchmaking, AI contract review, recruiting intelligence, and a professional athlete
					profile — everything serious athletes need.
				</p>
				<div className="mt-10 flex flex-wrap justify-center gap-4">
					<Button asChild size="lg">
						<Link href="/signup">
							Get Started Free
							<ArrowRight />
						</Link>
					</Button>
					<Button asChild size="lg" variant="outline">
						<Link href="/login">Sign In</Link>
					</Button>
				</div>
			</section>

			{/* Features */}
			<section className="bg-muted/30 px-4 py-24">
				<h2 className="text-headline mb-4 text-center">Everything You Need</h2>
				<p className="mx-auto mb-16 max-w-xl text-center text-muted-foreground">
					Built for athletes navigating NIL, recruiting, and career decisions.
				</p>
				<div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{features.map((feature) => (
						<div key={feature.title} className="flex flex-col gap-3 rounded-xl border bg-card p-6">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
								<feature.icon className="h-full w-full" />
							</div>
							<p className="text-lg font-semibold">{feature.title}</p>
							<p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
						</div>
					))}
				</div>
			</section>

			{/* CTA Banner */}
			<section className="bg-primary px-4 py-24 text-center text-primary-foreground">
				<h2 className="text-headline mb-4">Ready to maximize your athletic career?</h2>
				<p className="mx-auto mb-8 max-w-md text-primary-foreground/80">
					Join thousands of athletes building their careers on Athlete OS.
				</p>
				<Button asChild size="lg" variant="secondary">
					<Link href="/signup">
						Create Your Free Profile
						<ArrowRight />
					</Link>
				</Button>
			</section>

			{/* Footer */}
			<footer className="border-t px-4 py-8">
				<div className="mx-auto flex max-w-6xl items-center justify-between">
					<div className="flex items-center gap-3">
						<span className="font-semibold">Athlete OS</span>
						<span className="text-sm text-muted-foreground">© 2026</span>
					</div>
					<Link
						href="/login"
						className="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						Sign In
					</Link>
				</div>
			</footer>
		</div>
	);
}
