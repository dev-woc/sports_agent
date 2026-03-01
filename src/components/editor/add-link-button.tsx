"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddLinkButtonProps {
	onAddLink: (title: string, url: string) => void;
	onAddHeader: (title: string) => void;
	onAddDivider: () => void;
}

export function AddLinkButton({ onAddLink, onAddHeader, onAddDivider }: AddLinkButtonProps) {
	const [linkOpen, setLinkOpen] = useState(false);
	const [headerOpen, setHeaderOpen] = useState(false);
	const [linkTitle, setLinkTitle] = useState("");
	const [linkUrl, setLinkUrl] = useState("");
	const [headerText, setHeaderText] = useState("");

	const handleAddLink = () => {
		if (linkTitle.trim() && linkUrl.trim()) {
			onAddLink(linkTitle.trim(), linkUrl.trim());
			setLinkTitle("");
			setLinkUrl("");
			setLinkOpen(false);
		}
	};

	const handleAddHeader = () => {
		if (headerText.trim()) {
			onAddHeader(headerText.trim());
			setHeaderText("");
			setHeaderOpen(false);
		}
	};

	return (
		<div className="flex gap-2">
			<Dialog open={linkOpen} onOpenChange={setLinkOpen}>
				<DialogTrigger asChild>
					<Button variant="outline" size="sm">
						Add Link
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add Link</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="link-title">Title</Label>
							<Input
								id="link-title"
								value={linkTitle}
								onChange={(e) => setLinkTitle(e.target.value)}
								placeholder="My Website"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="link-url">URL</Label>
							<Input
								id="link-url"
								value={linkUrl}
								onChange={(e) => setLinkUrl(e.target.value)}
								placeholder="https://example.com"
							/>
						</div>
						<Button onClick={handleAddLink} className="w-full">
							Add
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={headerOpen} onOpenChange={setHeaderOpen}>
				<DialogTrigger asChild>
					<Button variant="outline" size="sm">
						Add Header
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add Header</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="header-text">Header</Label>
							<Input
								id="header-text"
								value={headerText}
								onChange={(e) => setHeaderText(e.target.value)}
								placeholder="Section Title"
							/>
						</div>
						<Button onClick={handleAddHeader} className="w-full">
							Add
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Button variant="outline" size="sm" onClick={onAddDivider}>
				Add Divider
			</Button>
		</div>
	);
}
