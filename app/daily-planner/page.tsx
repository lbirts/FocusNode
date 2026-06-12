"use client";

import {
  AddTaskDialog,
  type AddTaskTeam,
  type AddTaskValues,
} from "@/app/components/AddTaskDialog";
import { cn } from "@/app/lib/utils";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Separator } from "@/ui/separator";
import {
  ChevronDown,
  Clock,
  LayoutGrid,
  Loader2,
  Plus,
  Timer,
} from "lucide-react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

type Priority = "Urgent" | "Medium" | "Normal";
type Category = "Design" | "Docs" | "Dev";

type Task = {
  id: number;
  title: string;
  board: string;
  priority: Priority;
  category: Category;
  estimate: string;
  status: "Not started" | "In progress" | "Completed";
  progress?: string;
};

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Build notification preferences panel",
    board: "Product Launch Q2",
    priority: "Urgent",
    category: "Docs",
    estimate: "2h",
    status: "In progress",
    progress: "25m in",
  },
  {
    id: 2,
    title: "Implement auth token refresh logic",
    board: "Product Launch Q2",
    priority: "Medium",
    category: "Dev",
    estimate: "3h",
    status: "Not started",
  },
  {
    id: 3,
    title: "Review PR #142 — payment flow",
    board: "Sprint 24",
    priority: "Medium",
    category: "Dev",
    estimate: "30m",
    status: "Not started",
  },
  {
    id: 4,
    title: "Write unit tests for payment module",
    board: "Product Launch Q2",
    priority: "Normal",
    category: "Dev",
    estimate: "1.5h",
    status: "Not started",
  },
  {
    id: 5,
    title: "Update API documentation v2.3",
    board: "Documentation",
    priority: "Normal",
    category: "Docs",
    estimate: "45m",
    status: "Not started",
  },
];

const boards = [
  { name: "Product Launch Q2", count: 12, connected: true },
  { name: "Sprint 24", count: 8, connected: true },
  { name: "Documentation", count: 4, connected: true },
  { name: "Daily Ops", count: 3, connected: false },
];

const filterOptions: ("All" | Category)[] = ["All", "Design", "Docs", "Dev"];

const rankOptions = ["Priority", "Time"] as const;
type RankBy = (typeof rankOptions)[number];

const priorityOrder: Record<Priority, number> = {
  Urgent: 0,
  Medium: 1,
  Normal: 2,
};

const plannerStatuses = ["Not started", "In progress", "Completed"] as const;

const plannerTeams: AddTaskTeam[] = (["Design", "Docs", "Dev"] as const).map(
  (category) => ({
    id: category,
    label: category,
    statuses: plannerStatuses.map((s) => ({ id: s, label: s })),
  }),
);

function estimateMinutes(estimate: string) {
  const match = estimate.match(/^([\d.]+)([hm])$/);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  return match[2] === "h" ? value * 60 : value;
}

const priorityStyles: Record<Priority, string> = {
  Urgent: "bg-red-light text-red",
  Medium: "bg-brand-light text-brand",
  Normal: "bg-secondary-50 text-secondary-400",
};

const STICKY_EDGE_SHADOW =
  "shadow-[0px_1px_3px_0px_#0000004D,0px_4px_8px_3px_#00000026]";

export default function DailyPlannerPage() {
  const [filter, setFilter] = useState<(typeof filterOptions)[number]>("All");
  const [rankBy, setRankBy] = useState<RankBy>("Priority");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [edgeShadow, setEdgeShadow] = useState({ top: false, bottom: false });

  const updateEdgeShadow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setEdgeShadow({
      top: scrollTop > 0,
      bottom: scrollTop + clientHeight < scrollHeight - 1,
    });
  }, []);

  useLayoutEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  }, [isLoading]);

  const visibleTasks = useMemo(() => {
    const filtered =
      filter === "All" ? tasks : tasks.filter((t) => t.category === filter);
    const sorted = [...filtered].sort((a, b) =>
      rankBy === "Priority"
        ? priorityOrder[a.priority] - priorityOrder[b.priority]
        : estimateMinutes(a.estimate) - estimateMinutes(b.estimate),
    );
    return sorted;
  }, [tasks, filter, rankBy]);

  useLayoutEffect(() => {
    updateEdgeShadow();
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateEdgeShadow);
    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleTasks.length, updateEdgeShadow]);

  const completed = tasks.filter((t) => t.status === "Completed").length;
  const remaining = tasks.length - completed;

  const [composerOpen, setComposerOpen] = useState(false);

  function createTask(values: AddTaskValues) {
    setTasks((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        title: values.title,
        board: "Product Launch Q2",
        // The planner has no "Low" lane in its priority order; fold it in.
        priority: values.priority === "Low" ? "Normal" : values.priority,
        category: values.teamId as Category,
        estimate: "30m",
        status: values.statusId as Task["status"],
      },
    ]);
  }

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
            Daily Planner
          </h3>
          <Separator orientation="vertical" data-testid="header-divider" />
          <p
            data-testid="muted-text-sample"
            className="text-primary-400 text-xs"
          >
            Saturday, March 14, 2026
          </p>
          <Separator orientation="vertical" />
          <p className="text-primary-400 text-xs">
            {visibleTasks.length} tasks queued
          </p>
          <Separator orientation="vertical" />
          <p className="text-primary-400 text-xs">~7h 45m estimated</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            data-testid="pull-from-boards"
            disabled={isLoading}
            onClick={() => setIsLoading(!isLoading)}
          >
            {isLoading ? (
              <Loader2 data-testid="pull-spinner" className="size-4 animate-spin" />
            ) : (
              <LayoutGrid className="size-4" />
            )}
            Pull from boards
          </Button>
          <Button
            size="sm"
            data-testid="auto-rank"
            className="bg-secondary-400 text-white hover:bg-secondary-400/90"
          >
            Auto-rank
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0 min-h-0 pt-4 pb-12 flex flex-col gap-4">
          <div className="flex items-center justify-between px-3">
            <p
              data-testid="eyebrow-label"
              className="text-xs font-medium uppercase text-primary-400"
            >
              Ranked tasks
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <p className="text-xs text-primary-400">Rank by:</p>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button size="sm" variant="outline" data-testid="rank-by">
                        {rankBy}
                        <ChevronDown />
                      </Button>
                    }
                  />
                  <DropdownMenuContent className="min-w-[140px] rounded-lg border border-primary-200 p-1! shadow-md outline-none">
                    <DropdownMenuRadioGroup
                      value={rankBy}
                      onValueChange={(v) => setRankBy(v as RankBy)}
                    >
                      {rankOptions.map((opt) => (
                        <DropdownMenuRadioItem
                          className="text-xs text-primary-500 px-2 py-1.5 rounded"
                          key={opt}
                          value={opt}
                        >
                          {opt}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-2">
                {filterOptions.map((opt) => {
                  const active = opt === filter;
                  return (
                    <Button
                      key={opt}
                      size="sm"
                      data-testid={`planner-filter-${opt.toLowerCase()}`}
                      variant={active ? "default" : "outline"}
                      onClick={() => setFilter(opt)}
                      className={cn(
                        active &&
                          "bg-secondary-400 text-white border-transparent hover:bg-secondary-400/90",
                      )}
                    >
                      {opt}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            ref={scrollRef}
            data-testid="planner-task-list"
            data-density="compact"
            className="flex min-h-0 flex-1 flex-col overflow-y-auto"
            onScroll={updateEdgeShadow}
          >
            <div
              aria-hidden
              className={cn(
                "sticky top-0 z-10 h-px shrink-0 bg-primary-50 transition-shadow",
                edgeShadow.top && STICKY_EDGE_SHADOW,
              )}
            />
            <div className="flex flex-col gap-2 px-3">
              {visibleTasks.map((task, idx) => (
                <div
                  key={task.id}
                  data-testid="planner-task"
                  className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[2px_4px_40px_10px_rgba(31,53,51,0.04)]"
                >
                  <div
                    data-testid="planner-task-index"
                    className="flex size-5 items-center justify-center rounded-full bg-primary-200 text-[10px] text-primary-500"
                  >
                    {idx + 1}
                  </div>
                  <div
                    data-testid="planner-task-body"
                    className="flex-1 min-w-0 rounded-lg border border-primary-100 bg-primary-50 p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-xs",
                            priorityStyles[task.priority],
                          )}
                        >
                          {task.priority}
                        </span>
                        <span className="rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-400">
                          {task.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-primary-400">
                          <Clock className="size-3" />
                          {task.estimate}
                        </span>
                        {task.progress ? (
                          <span className="flex items-center gap-1.5 rounded bg-secondary-50 px-1.5 py-0.5 text-xs text-secondary-400">
                            <Timer className="size-3" />
                            {task.progress}
                          </span>
                        ) : (
                          <span className="rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-400">
                            {task.status}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col gap-2">
                      <p
                        data-testid="planner-task-title"
                        className="text-sm text-primary-500"
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-primary-400">{task.board}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div
              className={cn(
                "sticky bottom-0 z-10 bg-primary-50 pt-2 transition-shadow px-3",
                edgeShadow.bottom &&
                  `${STICKY_EDGE_SHADOW} border-t border-primary-200`,
              )}
            >
              <Button
                size="sm"
                data-testid="add-task"
                onClick={() => setComposerOpen(true)}
                className="w-full rounded-lg border-dashed border-primary-300 text-xs bg-transparent"
              >
                <Plus className="size-4" />
                Add task to today
              </Button>
              <AddTaskDialog
                open={composerOpen}
                onOpenChange={setComposerOpen}
                teams={plannerTeams}
                onCreate={createTask}
              />
            </div>
          </div>
        </div>

        <aside className="w-[300px] shrink-0 border-l border-primary-200 px-3 py-5 flex flex-col gap-5 min-h-0 overflow-y-auto">
          <h3 className="text-base text-primary-600 font-medium">
            Connected Boards
          </h3>
          <div
            data-testid="connected-boards"
            className="flex flex-1 flex-col gap-1"
          >
            {boards.map((board) => (
              <div
                key={board.name}
                className="flex items-center justify-between rounded-lg border border-primary-200 bg-primary-50 p-4"
              >
                <div className="flex flex-col gap-2 min-w-0">
                  <p className="text-sm text-primary-400">{board.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "size-3 rounded-full border-[1.125px] border-primary-100",
                        board.connected ? "bg-brand" : "bg-primary-500",
                      )}
                    />
                    <p className="text-[10px] text-primary-400">
                      {board.connected ? "Synced" : "Not connected"}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-primary-400">
                  {board.count} tasks
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4 rounded-lg border border-primary-200 bg-primary-50 p-4">
            <p className="text-xs font-medium uppercase text-primary-400">
              Today&apos;s stats
            </p>
            <div
              data-testid="today-stats-grid"
              className="grid grid-cols-2 gap-2"
            >
              <Stat
                value={completed}
                label="Completed"
                highlight
                className="col-start-1"
                testId="stat-completed"
              />
              <Stat
                value={remaining}
                label="Remaining"
                className="col-start-2"
              />
              <Stat value="78%" label="Capacity" className="col-start-1" />
              <Stat value="2:35" label="Focus time" className="col-start-2" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  highlight,
  className,
  testId,
}: {
  value: number | string;
  label: string;
  highlight?: boolean;
  className?: string;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "flex flex-col gap-1 rounded-lg bg-primary-100 px-3 pt-2 pb-3",
        className,
      )}
    >
      <p
        data-testid="stat-value"
        className={cn(
          "text-3xl font-semibold",
          highlight ? "text-brand" : "text-secondary-400",
        )}
      >
        {value}
      </p>
      <p className="text-xs text-primary-400">{label}</p>
    </div>
  );
}
