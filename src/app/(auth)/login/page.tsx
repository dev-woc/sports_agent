import Link from "next/link";
import { GoogleButton } from "@/components/auth/google-button";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Sign in to your account</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<LoginForm />
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
					Don&apos;t have an account?{" "}
					<Link href="/signup" className="underline">
						Sign up
					</Link>
				</p>
			</CardContent>
		</Card>
	);
}
