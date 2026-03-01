import type { ThemeProps } from "@/types";

export function MinimalTheme({ displayName, bio, avatarUrl, links, isPreview }: ThemeProps) {
	return (
		<div className="flex min-h-full flex-col items-center bg-white px-4 py-8 text-gray-900">
			{avatarUrl ? (
				<img
					src={avatarUrl}
					alt={displayName || "Avatar"}
					className="h-20 w-20 rounded-full object-cover mb-4"
				/>
			) : (
				<div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
					<span className="text-2xl text-gray-500">{displayName?.[0]?.toUpperCase() ?? "?"}</span>
				</div>
			)}
			{displayName && <h1 className="text-xl font-bold mb-1">{displayName}</h1>}
			{bio && <p className="text-sm text-gray-600 text-center max-w-xs mb-6">{bio}</p>}
			<div className="w-full max-w-sm space-y-3">
				{links.map((item) => {
					if (item.type === "header")
						return (
							<h2 key={item.id} className="text-sm font-semibold text-gray-500 pt-2">
								{item.title}
							</h2>
						);
					if (item.type === "divider") return <hr key={item.id} className="border-gray-200" />;
					if (isPreview)
						return (
							<div
								key={item.id}
								className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium hover:bg-gray-50 cursor-pointer"
							>
								{item.title}
							</div>
						);
					return (
						<a
							key={item.id}
							href={item.url ?? undefined}
							target="_blank"
							rel="noopener noreferrer"
							className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium hover:bg-gray-50"
						>
							{item.title}
						</a>
					);
				})}
			</div>
		</div>
	);
}
