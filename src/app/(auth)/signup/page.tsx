import Link from "next/link";
import { GoogleButton } from "@/components/auth/google-button";
import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Create your account</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<SignupForm />
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-card px-2 text-muted-foreground">Or</span>
					</div>
				</div>
				<GoogleButton />
				<p className="text-center text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link href="/login" className="underline">
						Sign in
					</Link>
				</p>
			</CardContent>
		</Card>
	);
}
