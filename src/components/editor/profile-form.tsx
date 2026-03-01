"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProfileFormProps {
	displayName: string;
	bio: string;
	avatarUrl: string;
	onDisplayNameChange: (value: string) => void;
	onBioChange: (value: string) => void;
	onAvatarUrlChange: (value: string) => void;
}

export function ProfileForm({
	displayName,
	bio,
	avatarUrl,
	onDisplayNameChange,
	onBioChange,
	onAvatarUrlChange,
}: ProfileFormProps) {
	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="display-name">Display Name</Label>
				<Input
					id="display-name"
					aria-label="Display Name"
					value={displayName}
					onChange={(e) => onDisplayNameChange(e.target.value)}
					maxLength={50}
					placeholder="Your name"
				/>
				<p className="text-xs text-muted-foreground text-right">{displayName.length}/50</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="bio">Bio</Label>
				<Textarea
					id="bio"
					aria-label="Bio"
					value={bio}
					onChange={(e) => onBioChange(e.target.value)}
					maxLength={160}
					rows={3}
					placeholder="Tell the world about yourself"
				/>
				<p className="text-xs text-muted-foreground text-right">{bio.length}/160</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="avatar-url">Avatar URL</Label>
				<div className="flex items-center gap-3">
					{avatarUrl ? (
						<img
							src={avatarUrl}
							alt="Avatar preview"
							className="h-10 w-10 rounded-full object-cover"
						/>
					) : (
						<div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
							<span className="text-sm text-muted-foreground">
								{displayName?.[0]?.toUpperCase() ?? "?"}
							</span>
						</div>
					)}
					<Input
						id="avatar-url"
						aria-label="Avatar URL"
						value={avatarUrl}
						onChange={(e) => onAvatarUrlChange(e.target.value)}
						placeholder="https://example.com/avatar.jpg"
						className="flex-1"
					/>
				</div>
			</div>
		</div>
	);
}
