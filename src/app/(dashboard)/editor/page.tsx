"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AddLinkButton } from "@/components/editor/add-link-button";
import { EditorToolbar, type LayoutMode } from "@/components/editor/editor-toolbar";
import { LinkList } from "@/components/editor/link-list";
import { ProfileForm } from "@/components/editor/profile-form";
import { PreviewPanel } from "@/components/preview/preview-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/use-profile";
import type { LinkItem } from "@/types";

export default function EditorPage() {
	const { profile, links: serverLinks, isLoading, error, refetch } = useProfile();

	const [displayName, setDisplayName] = useState("");
	const [bio, setBio] = useState("");
	const [avatarUrl, setAvatarUrl] = useState("");
	const [links, setLinks] = useState<LinkItem[]>([]);
	const [isDirty, setIsDirty] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [layoutMode, setLayoutMode] = useState<LayoutMode>("both");

	const addedLinksRef = useRef<LinkItem[]>([]);
	const deletedIdsRef = useRef<Set<string>>(new Set());
	const initializedRef = useRef(false);

	useEffect(() => {
		if (profile && !initializedRef.current) {
			setDisplayName(profile.displayName);
			setBio(profile.bio);
			setAvatarUrl(profile.avatarUrl);
			setLinks(serverLinks);
			initializedRef.current = true;
		}
	}, [profile, serverLinks]);

	const markDirty = () => setIsDirty(true);

	const handleDisplayNameChange = (v: string) => {
		setDisplayName(v);
		markDirty();
	};
	const handleBioChange = (v: string) => {
		setBio(v);
		markDirty();
	};
	const handleAvatarUrlChange = (v: string) => {
		setAvatarUrl(v);
		markDirty();
	};

	const handleReorder = (reordered: LinkItem[]) => {
		setLinks(reordered);
		markDirty();
	};

	const handleDeleteLink = (id: string) => {
		const isNew = addedLinksRef.current.some((l) => l.id === id);
		if (isNew) {
			addedLinksRef.current = addedLinksRef.current.filter((l) => l.id !== id);
		} else {
			deletedIdsRef.current.add(id);
		}
		setLinks((prev) => prev.filter((l) => l.id !== id));
		markDirty();
	};

	const handleAddLink = (title: string, url: string) => {
		const newLink: LinkItem = {
			id: crypto.randomUUID(),
			profileId: profile?.id ?? "",
			type: "link",
			title,
			url,
			sortOrder: links.length,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		addedLinksRef.current.push(newLink);
		setLinks((prev) => [...prev, newLink]);
		markDirty();
	};

	const handleAddHeader = (title: string) => {
		const newHeader: LinkItem = {
			id: crypto.randomUUID(),
			profileId: profile?.id ?? "",
			type: "header",
			title,
			url: "",
			sortOrder: links.length,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		addedLinksRef.current.push(newHeader);
		setLinks((prev) => [...prev, newHeader]);
		markDirty();
	};

	const handleAddDivider = () => {
		const newDivider: LinkItem = {
			id: crypto.randomUUID(),
			profileId: profile?.id ?? "",
			type: "divider",
			title: "",
			url: "",
			sortOrder: links.length,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		addedLinksRef.current.push(newDivider);
		setLinks((prev) => [...prev, newDivider]);
		markDirty();
	};

	const handleSave = async () => {
		if (!profile || isSaving) return;
		setIsSaving(true);
		try {
			const profileRes = await fetch("/api/profile", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ displayName, bio, avatarUrl, theme: profile.theme }),
			});
			if (!profileRes.ok) throw new Error("Failed to update profile");

			for (const id of deletedIdsRef.current) {
				await fetch(`/api/links/${id}`, { method: "DELETE" });
			}

			const newIdMap = new Map<string, string>();
			for (const item of addedLinksRef.current) {
				const res = await fetch("/api/links", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						type: item.type,
						title: item.title || undefined,
						url: item.url || undefined,
					}),
				});
				if (res.ok) {
					const data = await res.json();
					newIdMap.set(item.id, data.link.id);
				}
			}

			const reorderItems = links
				.filter((l) => !deletedIdsRef.current.has(l.id))
				.map((l, index) => ({ id: newIdMap.get(l.id) ?? l.id, sortOrder: index }));
			if (reorderItems.length > 0) {
				await fetch("/api/links/reorder", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ items: reorderItems }),
				});
			}

			addedLinksRef.current = [];
			deletedIdsRef.current.clear();
			initializedRef.current = false;
			await refetch();
			setIsDirty(false);
			toast.success("Changes saved successfully!");
		} catch {
			toast.error("Failed to save changes. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const previewLinks = links.map((l) => ({
		id: l.id,
		type: l.type as "link" | "header" | "divider",
		title: l.title,
		url: l.url,
	}));

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[50vh]">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
				<p className="text-red-600">{error}</p>
				<Button onClick={() => refetch()}>Retry</Button>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="flex items-center justify-center min-h-[50vh]">
				<p className="text-muted-foreground">No profile found. Please sign up first.</p>
			</div>
		);
	}

	const editorContent = (
		<div className="space-y-6 p-4 lg:p-6">
			<ProfileForm
				displayName={displayName}
				bio={bio}
				avatarUrl={avatarUrl}
				onDisplayNameChange={handleDisplayNameChange}
				onBioChange={handleBioChange}
				onAvatarUrlChange={handleAvatarUrlChange}
			/>
			<div className="space-y-3">
				<h2 className="text-lg font-semibold">Links</h2>
				<LinkList links={links} onReorder={handleReorder} onDelete={handleDeleteLink} />
				<AddLinkButton
					onAddLink={handleAddLink}
					onAddHeader={handleAddHeader}
					onAddDivider={handleAddDivider}
				/>
			</div>
		</div>
	);

	const previewContent = (
		<div className="flex items-start justify-center p-4 lg:p-6">
			<PreviewPanel
				displayName={displayName}
				bio={bio}
				avatarUrl={avatarUrl}
				links={previewLinks}
			/>
		</div>
	);

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between border-b px-4 py-2">
				<EditorToolbar mode={layoutMode} onModeChange={setLayoutMode} />
				<Button onClick={handleSave} disabled={!isDirty || isSaving} aria-label="Save">
					{isSaving ? "Saving..." : "Save"}
				</Button>
			</div>

			{/* Desktop layout */}
			<div
				className="hidden lg:grid flex-1"
				style={{
					gridTemplateColumns: layoutMode === "both" ? "1fr 1fr" : "1fr",
				}}
			>
				{(layoutMode === "both" || layoutMode === "editor") && (
					<div className="overflow-y-auto border-r">{editorContent}</div>
				)}
				{(layoutMode === "both" || layoutMode === "preview") && (
					<div className="overflow-y-auto bg-muted/20">{previewContent}</div>
				)}
			</div>

			{/* Mobile layout */}
			<div className="lg:hidden flex-1">
				<Tabs defaultValue="edit" className="h-full flex flex-col">
					<TabsList className="mx-4 mt-2">
						<TabsTrigger value="edit">Edit</TabsTrigger>
						<TabsTrigger value="preview">Preview</TabsTrigger>
					</TabsList>
					<TabsContent value="edit" className="flex-1 overflow-y-auto">
						{editorContent}
					</TabsContent>
					<TabsContent value="preview" className="flex-1 overflow-y-auto">
						{previewContent}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
