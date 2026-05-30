"use client";

import { cn } from "@/app/lib/utils";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  Share2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarImage } from "../components/ui/avatar";

type Priority = "Urgent" | "Medium" | "Normal" | "Low";
type Category = "Engineering" | "Design";
type Status = "Approved" | "In Progress" | "Not Started";
type Filter = "All" | "Design" | "Docs" | "Dev";

type Task = {
  id: number;
  name: string;
  category: Category;
  status: Status;
  priority: Priority;
  due: string;
  dueDate: string; // ISO for sorting
  filter: Exclude<Filter, "All">;
  assignees: string[];
};

const avatars = [
  "/avatars/Copy of 069-05_img1.jpg",
  "/avatars/Copy of 069-05_img2.jpg",
  "/avatars/Copy of 069-05_img3.jpg",
];

const tasks: Task[] = [
  {
    id: 1,
    name: "Implement auth token refresh logic",
    category: "Engineering",
    status: "Approved",
    priority: "Medium",
    due: "3/27",
    dueDate: "2026-03-27",
    filter: "Dev",
    assignees: [avatars[0], avatars[1]],
  },
  {
    id: 2,
    name: "Review PR #142 — payment flow",
    category: "Engineering",
    status: "Approved",
    priority: "Normal",
    due: "3/17",
    dueDate: "2026-03-17",
    filter: "Dev",
    assignees: [avatars[2], avatars[1]],
  },
  {
    id: 3,
    name: "Write unit tests for payment module",
    category: "Engineering",
    status: "Approved",
    priority: "Low",
    due: "3/22",
    dueDate: "2026-03-22",
    filter: "Dev",
    assignees: [avatars[0], avatars[2]],
  },
  {
    id: 4,
    name: "Build notification preferences panel",
    category: "Engineering",
    status: "In Progress",
    priority: "Urgent",
    due: "3/15",
    dueDate: "2026-03-15",
    filter: "Dev",
    assignees: [avatars[1]],
  },
  {
    id: 5,
    name: "Update API documentation v2.3",
    category: "Engineering",
    status: "In Progress",
    priority: "Normal",
    due: "3/20",
    dueDate: "2026-03-20",
    filter: "Docs",
    assignees: [avatars[2]],
  },
  {
    id: 6,
    name: "Design onboarding flow v2",
    category: "Design",
    status: "In Progress",
    priority: "Medium",
    due: "3/22",
    dueDate: "2026-03-22",
    filter: "Design",
    assignees: [avatars[0]],
  },
  {
    id: 7,
    name: "Iconography audit",
    category: "Design",
    status: "In Progress",
    priority: "Low",
    due: "3/28",
    dueDate: "2026-03-28",
    filter: "Design",
    assignees: [avatars[1]],
  },
  {
    id: 8,
    name: "Settings page exploration",
    category: "Design",
    status: "Not Started",
    priority: "Normal",
    due: "4/02",
    dueDate: "2026-04-02",
    filter: "Design",
    assignees: [avatars[2]],
  },
];

const priorityStyles: Record<Priority, string> = {
  Urgent: "bg-red-light text-red",
  Medium: "bg-brand-light text-brand",
  Normal: "bg-secondary-50 text-secondary-400",
  Low: "bg-primary-100 text-primary-400",
};

const priorityOrder: Record<Priority, number> = {
  Urgent: 0,
  Medium: 1,
  Normal: 2,
  Low: 3,
};

const filterOptions: Filter[] = ["All", "Design", "Docs", "Dev"];
const rankOptions = ["Priority", "Due date"] as const;
type RankBy = (typeof rankOptions)[number];

const tabs = [
  { id: "board", label: "Board", icon: LayoutGrid },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "list", label: "List", icon: List },
] as const;

export default function TeamWorkloadPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("list");

  return (
    <div className="h-full w-full flex flex-col bg-primary-50">
      <div
        data-testid="page-header"
        className="border-b border-primary-200 px-3 h-[58px] flex items-center justify-between gap-2"
      >
        <h3
          data-testid="page-title"
          className="text-base text-primary-600 font-medium"
        >
          Team Workload
        </h3>
        <Button size="sm" variant="outline">
          <Share2 />
          Share
        </Button>
      </div>

      <div className="border-b border-primary-200 px-3 flex items-center gap-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = id === tab;
          return (
            <Button
              variant="link"
              key={id}
              data-testid={`team-tab-${id}`}
              data-active={active ? "true" : undefined}
              onClick={() => setTab(id)}
              className={cn("pt-3 pb-2 text-xs")}
            >
              <Icon className="size-3" />
              {label}
            </Button>
          );
        })}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
        {tab === "list" ? (
          <ListView />
        ) : (
          <Placeholder label={tabs.find((t) => t.id === tab)!.label} />
        )}
      </div>
    </div>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border border-dashed border-primary-200 text-sm text-primary-400">
      <Users className="mr-2 size-4" />
      {label} view coming soon
    </div>
  );
}

function ListView() {
  const [filter, setFilter] = useState<Filter>("All");
  const [rankBy, setRankBy] = useState<RankBy>("Priority");
  const [openCategories, setOpenCategories] = useState<
    Record<Category, boolean>
  >({
    Engineering: true,
    Design: true,
  });

  const filtered = useMemo(
    () => (filter === "All" ? tasks : tasks.filter((t) => t.filter === filter)),
    [filter],
  );

  function toggleCategory(c: Category) {
    setOpenCategories((s) => ({ ...s, [c]: !s[c] }));
  }

  return (
    <div data-testid="team-list-view" className="flex flex-col gap-3">
      <div className="flex items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <p
            data-testid="muted-text-sample"
            className="text-xs text-primary-400"
          >
            Rank by:
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button size="sm" variant="outline">
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

      {(["Engineering", "Design"] as Category[]).map((category) => {
        const inCategory = filtered.filter((t) => t.category === category);
        const open = openCategories[category];
        const groups: Status[] = ["Approved", "In Progress", "Not Started"];
        return (
          <div key={category} className="flex flex-col gap-3">
            <Button
              variant="ghost"
              data-active={open}
              onClick={() => toggleCategory(category)}
              className="gap-3 self-start p-0 h-fit border-0 hover:bg-transparent"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-primary-200 text-primary-500">
                {open ? (
                  <ChevronUp className="size-3" />
                ) : (
                  <ChevronDown className="size-3" />
                )}
              </span>
              <span
                data-testid="eyebrow-label"
                className="text-xs font-medium uppercase text-primary-600"
              >
                {category}
              </span>
            </Button>

            {open && (
              <div className="flex flex-col gap-3">
                {groups.map((status) => {
                  const rows = inCategory.filter((t) => t.status === status);
                  return (
                    <StatusGroup
                      key={status}
                      status={status}
                      tasks={rows}
                      rankBy={rankBy}
                      defaultOpen={status === "Approved" && rows.length > 0}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusGroup({
  status,
  tasks,
  rankBy,
  defaultOpen,
}: {
  status: Status;
  tasks: Task[];
  rankBy: RankBy;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const sorted = useMemo(() => {
    return [...tasks].sort((a, b) =>
      rankBy === "Priority"
        ? priorityOrder[a.priority] - priorityOrder[b.priority]
        : a.dueDate.localeCompare(b.dueDate),
    );
  }, [tasks, rankBy]);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-[2px_4px_20px_rgba(31,53,51,0.04)]">
      <Button
        variant="ghost"
        onClick={() => setOpen((o) => !o)}
        data-active={open}
        className={cn(
          "gap-2 self-start rounded-full px-2 py-1 h-fit border-0",
          open &&
            "bg-secondary-50 pl-1.5 data-[active=true]:hover:bg-secondary-50",
        )}
      >
        {open ? (
          <ChevronUp className="size-3 text-secondary-400" />
        ) : (
          <ChevronDown className="size-3 text-secondary-400" />
        )}
        <span className="text-xs font-medium uppercase text-secondary-400">
          {status} ({tasks.length})
        </span>
      </Button>

      {open && tasks.length > 0 && (
        <div className="mt-2 flex flex-col">
          <div className="flex items-center justify-between border-b border-primary-100 py-3 text-[10px] text-primary-400">
            <span className="w-[300px]">Name</span>
            <span className="w-[100px] text-center">Assignee</span>
            <span className="w-[100px] text-center">Due date</span>
            <span className="w-[100px] text-center">Priority</span>
          </div>
          {sorted.map((task, idx) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center justify-between py-3",
                idx < sorted.length - 1 && "border-b border-primary-100",
              )}
            >
              <p className="w-[300px] text-sm text-primary-500">{task.name}</p>
              <div className="flex w-[100px] items-center justify-center">
                {task.assignees.map((src, i) => (
                  <Avatar
                    key={src}
                    data-testid="task-assignee-avatar"
                    className={cn(
                      "size-5 border-[3px] border-primary-50",
                      i < task.assignees.length - 1 && "-mr-1",
                    )}
                  >
                    <AvatarImage src={src} alt="User profile pic" />
                  </Avatar>
                ))}
              </div>
              <div className="flex w-[100px] justify-center">
                <span className="flex items-center gap-1.5 rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-400">
                  <Calendar className="size-3" />
                  {task.due}
                </span>
              </div>
              <div className="flex w-[100px] justify-center">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-xs",
                    priorityStyles[task.priority],
                  )}
                >
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
