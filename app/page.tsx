"use client";

import {
  type Board,
  type Card,
  type Column,
  type Priority,
  type Swimlane,
  getBoard,
} from "@/app/lib/boards";
import { cn } from "@/app/lib/utils";
import { Avatar, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Separator } from "@/ui/separator";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Pencil,
  Plus,
  UserPlus,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

const priorityStyles: Record<Priority, string> = {
  Urgent: "bg-red-light text-red",
  Medium: "bg-brand-light text-brand",
  Normal: "bg-secondary-50 text-secondary-400",
  Low: "bg-primary-100 text-primary-400",
};

const newCardAvatar = "/avatars/Copy of 069-05_img1.jpg";

function totals(board: Board) {
  let tasks = 0;
  let swimlanes = 0;
  for (const s of board.swimlanes) {
    swimlanes += 1;
    for (const c of s.columns) tasks += c.cards.length;
  }
  return { tasks, swimlanes };
}

export default function KanbanPage() {
  return (
    <Suspense fallback={<KanbanPageFallback />}>
      <KanbanBoard />
    </Suspense>
  );
}

function KanbanPageFallback() {
  return (
    <div className="h-full w-full animate-pulse bg-primary-50" aria-hidden />
  );
}

function KanbanBoard() {
  const searchParams = useSearchParams();
  const boardId = searchParams.get("board");
  const board = useMemo(() => getBoard(boardId), [boardId]);

  const [swimlanes, setSwimlanes] = useState<Swimlane[]>(board.swimlanes);
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(board.swimlanes.map((s, i) => [s.id, i === 0])),
  );

  useEffect(() => {
    setSwimlanes(board.swimlanes);
    setOpen(Object.fromEntries(board.swimlanes.map((s, i) => [s.id, i === 0])));
  }, [board]);

  function toggleSwimlane(id: string) {
    setOpen((s) => ({ ...s, [id]: !s[id] }));
  }

  function moveCard(
    cardId: number,
    fromSwimlane: string,
    fromColumn: string,
    toSwimlane: string,
    toColumn: string,
  ) {
    if (fromSwimlane === toSwimlane && fromColumn === toColumn) return;
    setSwimlanes((prev) => {
      let moved: Card | undefined;
      const stripped = prev.map((s) =>
        s.id !== fromSwimlane
          ? s
          : {
              ...s,
              columns: s.columns.map((c) => {
                if (c.id !== fromColumn) return c;
                const idx = c.cards.findIndex((card) => card.id === cardId);
                if (idx === -1) return c;
                moved = c.cards[idx];
                return {
                  ...c,
                  cards: c.cards.filter((_, i) => i !== idx),
                };
              }),
            },
      );
      if (!moved) return prev;
      return stripped.map((s) =>
        s.id !== toSwimlane
          ? s
          : {
              ...s,
              columns: s.columns.map((c) =>
                c.id !== toColumn ? c : { ...c, cards: [...c.cards, moved!] },
              ),
            },
      );
    });
  }

  function addCard(swimlaneId: string, columnId: string) {
    setSwimlanes((prev) =>
      prev.map((s) =>
        s.id !== swimlaneId
          ? s
          : {
              ...s,
              columns: s.columns.map((c) =>
                c.id !== columnId
                  ? c
                  : {
                      ...c,
                      cards: [
                        ...c.cards,
                        {
                          id: Date.now(),
                          title: "New card",
                          priority: "Normal",
                          tag: s.title,
                          assignee: newCardAvatar,
                        },
                      ],
                    },
              ),
            },
      ),
    );
  }

  const stats = totals({ ...board, swimlanes });

  return (
    <div className="h-full w-full flex flex-col bg-primary-50">
      <div
        data-testid="page-header"
        className="border-b border-primary-200 px-3 h-[58px] flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <h3
            data-testid="page-title"
            className="text-base text-primary-600 font-medium"
          >
            {board.title}
          </h3>
          <Pencil className="size-4 text-primary-400" />
          <Separator orientation="vertical" />
          <p
            data-testid="muted-text-sample"
            className="text-primary-400 text-xs"
          >
            {stats.swimlanes} swimlanes
          </p>
          <Separator orientation="vertical" />
          <p className="text-primary-400 text-xs">{stats.tasks} tasks</p>
          <Separator orientation="vertical" />
          <div className="flex items-center">
            {Array.from({ length: Math.min(board.memberCount, 3) }).map(
              (_, i) => (
                <Avatar
                  key={i}
                  className={cn(
                    "size-5 border-[3px] border-primary-50",
                    i < 2 && "-mr-1",
                  )}
                >
                  <AvatarImage
                    src={`/avatars/Copy of 069-05_img${i + 1}.jpg`}
                    alt="User profile pic"
                  />
                </Avatar>
              ),
            )}
          </div>
          <p
            data-testid="member-count-label"
            className="text-primary-400 text-xs"
          >
            {board.memberCount} members
          </p>
          <Button size="sm" variant="outline">
            <UserPlus />
            Invite
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-primary-400 text-xs">Group by:</p>
          <Button size="sm" variant="outline">
            Swimlane
            <ChevronDown />
          </Button>
          <Button
            size="sm"
            className="bg-secondary-400 text-white hover:bg-secondary-400/90"
          >
            <Plus />
            Add Task
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {swimlanes.map((swimlane) => {
          const expanded = open[swimlane.id];
          return (
            <div
              key={swimlane.id}
              className="border-b border-primary-200 px-3 pt-4 pb-12 flex flex-col gap-4"
            >
              <Button
                variant="ghost"
                onClick={() => toggleSwimlane(swimlane.id)}
                className="gap-3 self-start p-0 h-fit hover:bg-transparent border-0"
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-primary-200 text-primary-500">
                  {expanded ? (
                    <ChevronUp className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  )}
                </span>
                <span
                  data-testid="eyebrow-label"
                  className="text-xs font-medium uppercase text-primary-600"
                >
                  {swimlane.title}
                </span>
              </Button>

              {expanded && swimlane.columns.length > 0 && (
                <div data-testid="swimlane-columns" className="flex gap-2">
                  {swimlane.columns.map((column) => (
                    <KanbanColumn
                      key={column.id}
                      column={column}
                      swimlaneId={swimlane.id}
                      onAddCard={() => addCard(swimlane.id, column.id)}
                      onDropCard={(payload) =>
                        moveCard(
                          payload.cardId,
                          payload.fromSwimlane,
                          payload.fromColumn,
                          swimlane.id,
                          column.id,
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type DropPayload = {
  cardId: number;
  fromSwimlane: string;
  fromColumn: string;
};

function KanbanColumn({
  column,
  swimlaneId,
  onAddCard,
  onDropCard,
}: {
  column: Column;
  swimlaneId: string;
  onAddCard: () => void;
  onDropCard: (payload: DropPayload) => void;
}) {
  const [isOver, setIsOver] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsOver(false);
    try {
      const data = JSON.parse(
        e.dataTransfer.getData("application/json"),
      ) as DropPayload;
      onDropCard(data);
    } catch {}
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      className={cn(
        "flex-1 min-w-0 flex flex-col rounded-2xl bg-white shadow-[2px_4px_40px_10px_rgba(31,53,51,0.04)] transition-colors",
        isOver && "ring-2 ring-brand",
      )}
    >
      <div className="flex items-center justify-between border-b border-primary-200 bg-primary-50 px-3 py-2 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <p className="text-xs text-primary-600">{column.title}</p>
          <span className="flex size-5 items-center justify-center rounded-full bg-primary-200 text-[10px] text-primary-500">
            {column.cards.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {column.wip != null && (
            <span className="rounded border border-primary-200 px-1.5 py-0.5 text-[10px] text-primary-400">
              WIP: {column.wip}
            </span>
          )}
          <Plus className="size-4 text-primary-400" />
          <MoreHorizontal className="size-4 text-primary-400" />
        </div>
      </div>
      <div className="flex flex-col gap-2 p-2 flex-1">
        {column.cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            swimlaneId={swimlaneId}
            columnId={column.id}
          />
        ))}
        <Button
          size="sm"
          onClick={onAddCard}
          className="w-full rounded-lg border-dashed border-primary-300 text-xs bg-transparent"
        >
          <Plus className="size-4" />
          Add card
        </Button>
      </div>
    </div>
  );
}

function KanbanCard({
  card,
  swimlaneId,
  columnId,
}: {
  card: Card;
  swimlaneId: string;
  columnId: string;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        const payload: DropPayload = {
          cardId: card.id,
          fromSwimlane: swimlaneId,
          fromColumn: columnId,
        };
        e.dataTransfer.setData("application/json", JSON.stringify(payload));
        e.dataTransfer.effectAllowed = "move";
      }}
      className="flex flex-col gap-3 rounded-lg border border-primary-100 bg-primary-50 p-3 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between">
        <span
          data-testid={`priority-badge-${card.priority.toLowerCase()}`}
          className={cn(
            "rounded px-1.5 py-0.5 text-xs",
            priorityStyles[card.priority],
          )}
        >
          {card.priority}
        </span>
        {card.due && (
          <span className="flex items-center gap-1.5 rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-400">
            <Calendar className="size-3" />
            {card.due}
          </span>
        )}
      </div>
      <p data-testid="card-title" className="text-sm text-primary-500">
        {card.title}
      </p>
      <div className="flex items-center justify-between">
        <span className="rounded bg-primary-100 px-1.5 py-0.5 text-[10px] text-primary-400">
          {card.tag}
        </span>
        <Avatar size="sm" className="size-5!">
          <AvatarImage src={card.assignee} alt="User profile pic" />
        </Avatar>
      </div>
    </div>
  );
}
