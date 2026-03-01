"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LinkItem } from "@/types";

interface LinkItemProps {
	item: LinkItem;
	onDelete: (id: string) => void;
}

export function LinkItemComponent({ item, onDelete }: LinkItemProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: item.id,
	});
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	if (item.type === "divider") {
		return (
			<div ref={setNodeRef} style={style} className="flex items-center gap-2 py-2">
				<button {...attributes} {...listeners} className="cursor-grab" aria-label="Drag handle">
					<GripVertical className="h-4 w-4 text-muted-foreground" />
				</button>
				<div className="flex-1 border-t" />
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onDelete(item.id)}
					aria-label="Delete divider"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
		);
	}

	if (item.type === "header") {
		return (
			<div
				ref={setNodeRef}
				style={style}
				className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3"
			>
				<button {...attributes} {...listeners} className="cursor-grab" aria-label="Drag handle">
					<GripVertical className="h-4 w-4 text-muted-foreground" />
				</button>
				<div className="flex-1">
					<p className="text-sm font-semibold">{item.title}</p>
					<p className="text-xs text-muted-foreground">Header</p>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onDelete(item.id)}
					aria-label="Delete header"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
		);
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="flex items-center gap-2 rounded-lg border bg-card p-3"
		>
			<button {...attributes} {...listeners} className="cursor-grab" aria-label="Drag handle">
				<GripVertical className="h-4 w-4 text-muted-foreground" />
			</button>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium truncate">{item.title}</p>
				<p className="text-xs text-muted-foreground truncate">{item.url}</p>
			</div>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => onDelete(item.id)}
				aria-label="Delete link"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
}
