"use client";
import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { LinkItem } from "@/types";
import { LinkItemComponent } from "./link-item";

interface LinkListProps {
	links: LinkItem[];
	onReorder: (reordered: LinkItem[]) => void;
	onDelete: (id: string) => void;
}

export function LinkList({ links, onReorder, onDelete }: LinkListProps) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const handleDragEnd = (event: any) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			const oldIndex = links.findIndex((l) => l.id === active.id);
			const newIndex = links.findIndex((l) => l.id === over.id);
			onReorder(arrayMove(links, oldIndex, newIndex));
		}
	};

	if (links.length === 0) {
		return (
			<p className="text-sm text-muted-foreground text-center py-4">
				No items yet. Add some below!
			</p>
		);
	}

	return (
		<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
			<SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
				<div className="space-y-2">
					{links.map((link) => (
						<LinkItemComponent key={link.id} item={link} onDelete={onDelete} />
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}
