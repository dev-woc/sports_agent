"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContractUploadForm() {
	const router = useRouter();
	const [file, setFile] = useState<File | null>(null);
	const [text, setText] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!file && !text.trim()) {
			setError("Upload a PDF or paste contract text.");
			return;
		}
		setLoading(true);
		setError(null);

		const formData = new FormData();
		if (file) formData.append("file", file);
		if (text) formData.append("text", text);

		const res = await fetch("/api/contracts", { method: "POST", body: formData });
		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			setError(data.error ?? "Something went wrong.");
			setLoading(false);
			return;
		}
		const { review } = await res.json();
		router.push(`/contracts/${review.id}`);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6">
			<div className="space-y-2">
				<Label>Upload PDF</Label>
				<input
					type="file"
					accept=".pdf"
					onChange={(e) => setFile(e.target.files?.[0] ?? null)}
					className="block text-sm"
				/>
			</div>
			<div className="space-y-2">
				<Label>Or paste contract text</Label>
				<Textarea
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="Paste contract text here..."
					rows={6}
				/>
			</div>
			{error && <p className="text-sm text-red-600">{error}</p>}
			<Button type="submit" disabled={loading} className="w-full">
				{loading ? "Analyzing..." : "Analyze Contract"}
			</Button>
			<p className="text-center text-xs text-muted-foreground">
				For informational purposes only. Not legal advice.
			</p>
		</form>
	);
}
