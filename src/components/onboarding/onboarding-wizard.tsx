"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	ELIGIBILITY_STATUSES,
	GRAD_YEARS,
	SPORTS,
	SPORTS_AND_POSITIONS,
	US_STATES,
} from "@/lib/sports-data";
import { DIVISIONS } from "@/lib/validations";

const SELECT_CLASS =
	"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export function OnboardingWizard() {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [sport, setSport] = useState("");
	const [position, setPosition] = useState("");
	const [school, setSchool] = useState("");
	const [division, setDivision] = useState("");
	const [state, setState] = useState("");
	const [gradYear, setGradYear] = useState("");
	const [eligibilityStatus, setEligibilityStatus] = useState("");
	const [socialInstagram, setSocialInstagram] = useState("");
	const [socialTiktok, setSocialTiktok] = useState("");
	const [socialTwitter, setSocialTwitter] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		fetch("/api/onboarding")
			.then((r) => r.json())
			.then((data) => {
				if (data.athleteProfile) router.push("/contracts");
			})
			.catch(() => {});
	}, [router]);

	function handleNextFromStep1() {
		if (!sport) {
			setError("Please select a sport");
			return;
		}
		setError(null);
		setStep(2);
	}

	function handleNextFromStep2() {
		if (!school.trim()) {
			setError("School name is required");
			return;
		}
		if (!division) {
			setError("Please select a division");
			return;
		}
		if (!state) {
			setError("Please select a state");
			return;
		}
		if (!gradYear) {
			setError("Please select a graduation year");
			return;
		}
		if (!eligibilityStatus) {
			setError("Please select your eligibility status");
			return;
		}
		setError(null);
		setStep(3);
	}

	async function handleFinish(e: React.FormEvent) {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/onboarding", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					sport,
					position,
					school,
					division,
					state,
					gradYear: Number(gradYear),
					eligibilityStatus,
					socialInstagram,
					socialTiktok,
					socialTwitter,
				}),
			});
			if (!res.ok) {
				const data = await res.json();
				setError(data.error ?? "Something went wrong. Please try again.");
				return;
			}
			router.push("/contracts");
		} catch {
			setError("Network error. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}

	const stepTitles = ["What's your sport?", "Your program", "Social reach"];
	const stepDescriptions = [
		"We'll match you with the right brands and opportunities.",
		"Help coaches and brands find you.",
		"Brands want to know your audience. Add your handles — all optional.",
	];

	return (
		<Card className="w-full max-w-lg">
			<CardHeader>
				<div className="flex gap-2 justify-center mb-2">
					{[1, 2, 3].map((s) => (
						<div
							key={s}
							className={`h-2 w-8 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`}
						/>
					))}
				</div>
				<p className="text-xs font-medium text-muted-foreground text-center tracking-wide uppercase">
					Step {step} of 3
				</p>
				<CardTitle className="text-2xl">{stepTitles[step - 1]}</CardTitle>
				<CardDescription>{stepDescriptions[step - 1]}</CardDescription>
			</CardHeader>
			<CardContent>
				{step === 1 && (
					<div className="space-y-6">
						<div className="space-y-2">
							<Label>Sport</Label>
							<select
								className={SELECT_CLASS}
								value={sport}
								onChange={(e) => {
									setSport(e.target.value);
									setPosition("");
								}}
							>
								<option value="">Select sport...</option>
								{SPORTS.map((s) => (
									<option key={s} value={s}>
										{s}
									</option>
								))}
							</select>
						</div>
						<div className="space-y-2">
							<Label>Position (optional)</Label>
							<select
								className={SELECT_CLASS}
								value={position}
								onChange={(e) => setPosition(e.target.value)}
								disabled={!sport}
							>
								<option value="">Select position...</option>
								{sport &&
									(SPORTS_AND_POSITIONS[sport] ?? []).map((p) => (
										<option key={p} value={p}>
											{p}
										</option>
									))}
							</select>
						</div>
						{error && <p className="text-sm text-red-600">{error}</p>}
						<Button className="w-full" onClick={handleNextFromStep1}>
							Next
						</Button>
					</div>
				)}

				{step === 2 && (
					<div className="space-y-6">
						<div className="space-y-2">
							<Label>School / University</Label>
							<Input
								value={school}
								onChange={(e) => setSchool(e.target.value)}
								placeholder="e.g. University of Michigan"
							/>
						</div>
						<div className="space-y-2">
							<Label>Division</Label>
							<select
								className={SELECT_CLASS}
								value={division}
								onChange={(e) => setDivision(e.target.value)}
							>
								<option value="">Select division...</option>
								{DIVISIONS.map((d) => (
									<option key={d} value={d}>
										{d}
									</option>
								))}
							</select>
						</div>
						<div className="space-y-2">
							<Label>State</Label>
							<select
								className={SELECT_CLASS}
								value={state}
								onChange={(e) => setState(e.target.value)}
							>
								<option value="">Select state...</option>
								{US_STATES.map((s) => (
									<option key={s.code} value={s.code}>
										{s.name}
									</option>
								))}
							</select>
						</div>
						<div className="space-y-2">
							<Label>Graduation Year</Label>
							<select
								className={SELECT_CLASS}
								value={gradYear}
								onChange={(e) => setGradYear(e.target.value)}
							>
								<option value="">Select year...</option>
								{GRAD_YEARS.map((y) => (
									<option key={y} value={y}>
										{y}
									</option>
								))}
							</select>
						</div>
						<div className="space-y-2">
							<Label>Eligibility Status</Label>
							<select
								className={SELECT_CLASS}
								value={eligibilityStatus}
								onChange={(e) => setEligibilityStatus(e.target.value)}
							>
								<option value="">Select status...</option>
								{ELIGIBILITY_STATUSES.map((s) => (
									<option key={s} value={s}>
										{s}
									</option>
								))}
							</select>
						</div>
						{error && <p className="text-sm text-red-600">{error}</p>}
						<div className="flex gap-2">
							<Button
								variant="outline"
								className="w-full"
								onClick={() => {
									setError(null);
									setStep(1);
								}}
							>
								Back
							</Button>
							<Button className="w-full" onClick={handleNextFromStep2}>
								Next
							</Button>
						</div>
					</div>
				)}

				{step === 3 && (
					<form onSubmit={handleFinish} className="space-y-6">
						<div className="space-y-2">
							<Label>Instagram</Label>
							<Input
								value={socialInstagram}
								onChange={(e) => setSocialInstagram(e.target.value)}
								placeholder="@handle"
							/>
						</div>
						<div className="space-y-2">
							<Label>TikTok</Label>
							<Input
								value={socialTiktok}
								onChange={(e) => setSocialTiktok(e.target.value)}
								placeholder="@handle"
							/>
						</div>
						<div className="space-y-2">
							<Label>Twitter / X</Label>
							<Input
								value={socialTwitter}
								onChange={(e) => setSocialTwitter(e.target.value)}
								placeholder="@handle"
							/>
						</div>
						{error && <p className="text-sm text-red-600">{error}</p>}
						<div className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={() => {
									setError(null);
									setStep(2);
								}}
							>
								Back
							</Button>
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Saving..." : "Finish"}
							</Button>
						</div>
					</form>
				)}
			</CardContent>
		</Card>
	);
}
