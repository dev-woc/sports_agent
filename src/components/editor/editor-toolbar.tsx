"use client";
import { Button } from "@/components/ui/button";

export type LayoutMode = "both" | "editor" | "preview";

interface EditorToolbarProps {
	mode: LayoutMode;
	onModeChange: (mode: LayoutMode) => void;
}

export function EditorToolbar({ mode, onModeChange }: EditorToolbarProps) {
	return (
		<div className="hidden lg:flex gap-1">
			{(["both", "editor", "preview"] as LayoutMode[]).map((m) => (
				<Button
					key={m}
					variant={mode === m ? "default" : "ghost"}
					size="sm"
					onClick={() => onModeChange(m)}
					aria-label={`Layout: ${m}`}
				>
					{m.charAt(0).toUpperCase() + m.slice(1)}
				</Button>
			))}
		</div>
	);
}
