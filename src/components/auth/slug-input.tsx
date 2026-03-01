"use client";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SlugInputProps {
	value: string;
	onChange: (v: string) => void;
	error?: string;
}

export function SlugInput({ value, onChange, error }: SlugInputProps) {
	const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">(
		"idle",
	);
	const [statusMessage, setStatusMessage] = useState("");
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (!value || value.length < 3) {
			setStatus("idle");
			setStatusMessage("");
			return;
		}

		setStatus("checking");
		if (timerRef.current) clearTimeout(timerRef.current);

		timerRef.current = setTimeout(async () => {
			try {
				const res = await fetch(`/api/slug/check?slug=${encodeURIComponent(value)}`);
				const data = await res.json();
				if (data.available) {
					setStatus("available");
					setStatusMessage("Username is available");
				} else {
					setStatus(data.error ? "invalid" : "taken");
					setStatusMessage(data.error || "Username is taken");
				}
			} catch {
				setStatus("idle");
				setStatusMessage("");
			}
		}, 300);

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [value]);

	return (
		<div className="space-y-2">
			<Label htmlFor="slug">Username</Label>
			<div className="relative">
				<Input
					id="slug"
					aria-label="Username"
					value={value}
					onChange={(e) => onChange(e.target.value.toLowerCase())}
					placeholder="your-username"
				/>
				{status === "available" && (
					<span
						role="img"
						className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
						aria-label="Available"
					>
						&#10003;
					</span>
				)}
				{(status === "taken" || status === "invalid") && (
					<span
						role="img"
						className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600"
						aria-label="Unavailable"
					>
						&#10007;
					</span>
				)}
			</div>
			{statusMessage && (
				<p className={`text-xs ${status === "available" ? "text-green-600" : "text-red-600"}`}>
					{statusMessage}
				</p>
			)}
			{error && <p className="text-xs text-red-600">{error}</p>}
		</div>
	);
}
