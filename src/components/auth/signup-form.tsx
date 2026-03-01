"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { slugSchema } from "@/lib/validations";
import { SlugInput } from "./slug-input";

export function SignupForm() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [slug, setSlug] = useState("");
	const [error, setError] = useState("");
	const [slugError, setSlugError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSlugError("");

		const slugResult = slugSchema.safeParse(slug);
		if (!slugResult.success) {
			setSlugError(slugResult.error.issues[0]?.message ?? "Invalid username");
			return;
		}

		setIsLoading(true);
		try {
			const { error: signUpError } = await authClient.signUp.email({ email, password, name });
			if (signUpError) {
				setError(signUpError.message ?? "Signup failed");
				return;
			}

			const profileRes = await fetch("/api/profile", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ slug, displayName: name }),
			});
			if (!profileRes.ok) {
				const data = await profileRes.json();
				setError(data.error ?? "Failed to create profile");
				return;
			}

			router.push("/onboarding");
		} catch {
			setError("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="name">Name</Label>
				<Input
					id="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Your name"
					required
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="you@example.com"
					required
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="password">Password</Label>
				<Input
					id="password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="********"
					required
				/>
			</div>
			<SlugInput value={slug} onChange={setSlug} error={slugError} />
			{error && <p className="text-sm text-red-600">{error}</p>}
			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? "Creating..." : "Create Account"}
			</Button>
		</form>
	);
}
