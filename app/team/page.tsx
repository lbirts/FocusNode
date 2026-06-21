"use client";

import { WORKLOAD_TABLE_LAYOUT } from "@/app/lib/tableLayout";
import { cn } from "@/app/lib/utils";
import { Avatar, AvatarImage } from "@/ui/avatar";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";
import {
  BookUser,
  Box,
  Calendar,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  Share2,
  Users,
} from "lucide-react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

type Priority = "Urgent" | "Medium" | "Normal" | "Low";
type Category = "Engineering" | "Design";
type Status = "Approved" | "In Progress" | "Not Started";
type Filter = "All" | "Design" | "Docs" | "Dev";

type User = {
  src: string;
  name: string;
  email: string;
  status: "Online" | "Offline";
  isAdmin: boolean;
  role: string;
  boardCount: number;
};

type Task = {
  id: number;
  name: string;
  category: Category;
  status: Status;
  priority: Priority;
  due: string;
  dueDate: string; // ISO for sorting
  filter: Exclude<Filter, "All">;
  assignees: User[];
};

const users: User[] = [
  {
    src: "/avatars/avatar-1.jpg",
    name: "Alex Morgan",
    email: "alex@focusnode.io",
    status: "Offline",
    isAdmin: true,
    role: "Engineer",
    boardCount: 6,
  },
  {
    src: "/avatars/avatar-2.jpg",
    name: "Pamela Smith",
    email: "pamela@focusnode.io",
    status: "Offline",
    isAdmin: false,
    role: "Product Owner",
    boardCount: 4,
  },
  {
    src: "/avatars/avatar-3.jpg",
    name: "Anna Williams",
    email: "anna@focusnode.io",
    status: "Online",
    isAdmin: true,
    role: "Designer",
    boardCount: 3,
  },
];

const tasks: Task[] = [
  {
    id: 1,
    name: "Implement auth token refresh and rotation across the API gateway, edge workers, and the background reconciliation queue",
    category: "Engineering",
    status: "Approved",
    priority: "Medium",
    due: "3/27",
    dueDate: "2026-03-27",
    filter: "Dev",
    assignees: [users[0], users[1]],
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
    assignees: [users[2], users[1]],
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
    assignees: [users[0], users[2]],
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
    assignees: [users[1]],
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
    assignees: [users[2]],
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
    assignees: [users[0]],
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
    assignees: [users[1]],
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
    assignees: [users[2]],
  },
  {
    id: 9,
    name: "Refactor websocket reconnect handling",
    category: "Engineering",
    status: "In Progress",
    priority: "Medium",
    due: "3/24",
    dueDate: "2026-03-24",
    filter: "Dev",
    assignees: [users[0], users[1]],
  },
  {
    id: 10,
    name: "Add rate limiting to public API",
    category: "Engineering",
    status: "Not Started",
    priority: "Urgent",
    due: "3/19",
    dueDate: "2026-03-19",
    filter: "Dev",
    assignees: [users[1]],
  },
  {
    id: 11,
    name: "Migrate logging to structured events",
    category: "Engineering",
    status: "Approved",
    priority: "Normal",
    due: "3/30",
    dueDate: "2026-03-30",
    filter: "Docs",
    assignees: [users[0], users[2]],
  },
  {
    id: 12,
    name: "Empty states illustration set",
    category: "Design",
    status: "In Progress",
    priority: "Medium",
    due: "3/26",
    dueDate: "2026-03-26",
    filter: "Design",
    assignees: [users[2]],
  },
  {
    id: 13,
    name: "Dark mode color audit",
    category: "Design",
    status: "Not Started",
    priority: "Low",
    due: "4/01",
    dueDate: "2026-04-01",
    filter: "Design",
    assignees: [users[0]],
  },
  {
    id: 14,
    name: "Notification toast motion spec",
    category: "Design",
    status: "Approved",
    priority: "Normal",
    due: "4/03",
    dueDate: "2026-04-03",
    filter: "Design",
    assignees: [users[1], users[2]],
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

const STICKY_EDGE_SHADOW =
  "shadow-[0px_1px_3px_0px_#0000004D,0px_4px_8px_3px_#00000026]";

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

      <div className="flex flex-1 min-h-0 flex-col py-4">
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
    <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border border-dashed border-primary-200 text-sm text-primary-400 px-3">
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

  const openCategoryCount =
    Object.values(openCategories).filter(Boolean).length;

  useLayoutEffect(() => {
    updateEdgeShadow();
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateEdgeShadow);
    observer.observe(el);
    return () => observer.disconnect();
  }, [filtered.length, openCategoryCount, updateEdgeShadow]);

  function toggleCategory(c: Category) {
    setOpenCategories((s) => ({ ...s, [c]: !s[c] }));
  }

  return (
    <div
      data-testid="team-list-view"
      className="flex min-h-0 flex-1 flex-col gap-3"
    >
      <div className="flex shrink-0 items-center justify-end gap-4 px-3">
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

      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        onScroll={updateEdgeShadow}
      >
        <div
          aria-hidden
          data-testid="list-edge-shadow-top"
          className={cn(
            "sticky top-0 z-10 h-px shrink-0 bg-primary-50 transition-shadow",
            edgeShadow.top && STICKY_EDGE_SHADOW,
          )}
        />
        <div className="flex flex-col gap-3 px-3">
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
                      const rows = inCategory.filter(
                        (t) => t.status === status,
                      );
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
        <div
          aria-hidden
          data-testid="list-edge-shadow-bottom"
          className={cn(
            "sticky bottom-0 z-10 h-px shrink-0 bg-primary-50 transition-shadow",
            edgeShadow.bottom && STICKY_EDGE_SHADOW,
          )}
        />
      </div>
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
        data-testid="status-group-toggle"
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
        <Table
          data-testid="workload-table"
          className="mt-2 w-full"
          style={{ tableLayout: WORKLOAD_TABLE_LAYOUT }}
        >
          <TableHeader>
            <TableRow className="border-b border-primary-100 text-[10px]">
              <TableHead className="py-3 text-left font-normal w-75 text-primary-400">
                Name
              </TableHead>
              <TableHead className="py-3 text-center font-normal w-25 text-primary-400">
                Assignee
              </TableHead>
              <TableHead className="py-3 text-center font-normal w-25 text-primary-400">
                Due date
              </TableHead>
              <TableHead className="py-3 text-center font-normal w-25 text-primary-400">
                Priority
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((task, idx) => (
              <TableRow
                key={task.id}
                className={cn(
                  idx < sorted.length - 1 && "border-b border-primary-100",
                )}
              >
                <TableCell
                  data-testid="workload-name-cell"
                  className="truncate py-3 text-sm text-primary-500"
                >
                  {task.name}
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center justify-center">
                    {task.assignees.map((assignee, i) => (
                      <Tooltip key={assignee.name}>
                        <TooltipTrigger>
                          <Avatar
                            data-testid="task-assignee-avatar"
                            className={cn(
                              "size-5 border-[3px] border-primary-50",
                              i < task.assignees.length - 1 && "-mr-1",
                            )}
                          >
                            <AvatarImage
                              src={assignee.src}
                              alt="User profile pic"
                            />
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div>
                            <div className="flex items-center gap-2">
                              <Avatar data-testid="member-avatar" size="sm">
                                <AvatarImage
                                  src={assignee.src}
                                  alt="User profile pic"
                                />
                              </Avatar>
                              <div>
                                <p className="font-semibold">
                                  {assignee.email}
                                  {assignee.isAdmin && (
                                    <span className="ml-2 text-primary-400/70 text-[9px] rounded-sm border border-primary-300 px-1 py-0.5">
                                      Admin
                                    </span>
                                  )}
                                </p>
                                <p className="text-primary-400/70 text-xs">
                                  {assignee.name}
                                </p>
                              </div>
                            </div>
                            <Separator
                              orientation="horizontal"
                              className="my-1 bg-primary-300/50"
                            />
                            <div className="flex items-center gap-1">
                              <div
                                className={cn(
                                  "size-1.5 rounded-full",
                                  assignee.status === "Online"
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-primary-400/75",
                                )}
                              />
                              <p>{assignee.status}</p>
                            </div>
                            <div className="flex items-center gap-1 mb-0.5">
                              <BookUser className="size-3.5" />
                              <p>{assignee.role}</p>
                            </div>
                            <div className="flex items-center gap-1 mb-0.5">
                              <Box className="size-3.5" />
                              <p>
                                Product Launch Q2
                                <span className="ml-1 text-primary-400/70">
                                  +{assignee.boardCount - 1}
                                </span>
                              </p>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex justify-center">
                    <span className="flex items-center gap-1.5 rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-400">
                      <Calendar className="size-3" />
                      {task.due}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex justify-center">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-xs",
                        priorityStyles[task.priority],
                      )}
                    >
                      {task.priority}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
