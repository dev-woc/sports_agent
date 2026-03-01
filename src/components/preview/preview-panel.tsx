"use client";
import { MinimalTheme } from "@/components/themes/minimal";
import type { ThemeProps } from "@/types";

type PreviewPanelProps = Omit<ThemeProps, "isPreview">;

export function PreviewPanel({ displayName, bio, avatarUrl, links }: PreviewPanelProps) {
	return (
		<div className="flex flex-col items-center">
			<div className="relative w-[375px] rounded-[2.5rem] border-4 border-gray-800 bg-gray-800 p-2 shadow-xl">
				<div className="mx-auto mb-2 h-6 w-32 rounded-b-2xl bg-gray-800" />
				<div className="h-[667px] overflow-y-auto rounded-[2rem] bg-white">
					<MinimalTheme
						displayName={displayName}
						bio={bio}
						avatarUrl={avatarUrl}
						links={links}
						isPreview
					/>
				</div>
				<div className="mx-auto mt-2 h-1 w-32 rounded-full bg-gray-600" />
			</div>
		</div>
	);
}
