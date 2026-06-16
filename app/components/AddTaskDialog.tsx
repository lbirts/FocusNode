"use client";

import { users, type Priority, type User } from "@/app/lib/boards";
import { cn } from "@/app/lib/utils";
import { Avatar, AvatarImage } from "@/ui/avatar";
import { Calendar as CalendarPicker } from "@/ui/calendar";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import {
  Calendar,
  Code,
  Flag,
  Inbox,
  Megaphone,
  Paintbrush,
  Search,
  User as UserIcon,
  Users,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

export type AddTaskStatus = { id: string; label: string };
export type AddTaskTeam = {
  id: string;
  label: string;
  statuses: AddTaskStatus[];
};
export type AddTaskValues = {
  title: string;
  teamId: string;
  statusId: string;
  due: string;
  priority: Priority;
  assignee: User;
};

const teamIcons: Record<string, ComponentType<{ className?: string }>> = {
  design: Paintbrush,
  engineering: Code,
  research: Search,
  marketing: Megaphone,
  dev: Code,
  docs: Inbox,
};

const priorities: { id: Priority; swatch: string }[] = [
  { id: "Urgent", swatch: "bg-red-light" },
  { id: "Medium", swatch: "bg-brand-light" },
  { id: "Normal", swatch: "bg-secondary-50" },
  { id: "Low", swatch: "bg-primary-100" },
];

// Figma popover spec: 200w, 12px radius, 40px items, primary-100 hover.
const menuClasses =
  "w-50 min-w-0 rounded-[12px] p-1 shadow-[0_8px_16px_rgba(0,0,0,0.08)] ring-black/8";
const menuItemClasses =
  "h-10 gap-[9px] rounded-md px-2 text-xs text-primary-400 focus:bg-primary-100 focus:text-primary-400 not-data-[variant=destructive]:focus:**:text-primary-400";

function formatDue(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function AddTaskDialog({
  open,
  onOpenChange,
  teams,
  defaultTeamId = null,
  defaultStatusId = null,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: AddTaskTeam[];
  defaultTeamId?: string | null;
  defaultStatusId?: string | null;
  onCreate: (values: AddTaskValues) => void;
}) {
  const [title, setTitle] = useState("");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [statusId, setStatusId] = useState<string | null>(null);
  const [due, setDue] = useState<Date | null>(null);
  const [dueOpen, setDueOpen] = useState(false);
  const [priority, setPriority] = useState<Priority | null>(null);
  const [assignee, setAssignee] = useState<User | null>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setTeamId(defaultTeamId);
    setStatusId(defaultStatusId);
    setDue(null);
    setDueOpen(false);
    setPriority(null);
    setAssignee(null);
  }, [open, defaultTeamId, defaultStatusId]);

  const team = teams.find((t) => t.id === teamId) ?? null;
  const statusSource = team ?? teams[0];
  const status = statusSource?.statuses.find((s) => s.id === statusId) ?? null;

  const canSubmit = Boolean(
    title.trim() && team && status && due && priority && assignee,
  );

  function submit() {
    if (!canSubmit || !team || !status || !due || !priority || !assignee)
      return;
    onCreate({
      title: title.trim(),
      teamId: team.id,
      statusId: status.id,
      due: formatDue(due),
      priority,
      assignee,
    });
    onOpenChange(false);
  }

  const TeamIcon = (team && teamIcons[team.id.toLowerCase()]) || Users;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="add-task-dialog"
        showCloseButton={false}
        overlayClassName="bg-primary-600/60 supports-backdrop-filter:backdrop-blur-none"
        className="w-[667px] gap-0 rounded-[16px] bg-white p-0 text-popover-foreground shadow-[2px_4px_40px_10px_rgba(31,53,51,0.10)] ring-0 sm:max-w-[667px]"
        initialFocus={titleRef}
      >
        <div className="flex items-center justify-between border-b border-primary-100 px-5 py-4">
          <DialogTitle className="text-base font-medium text-primary-600">
            Add Task
          </DialogTitle>
          <DialogClose
            data-testid="add-task-close"
            aria-label="Close"
            className="-m-1 cursor-pointer p-1 text-primary-500 hover:text-primary-600"
          >
            <X className="size-3" strokeWidth={2.4} />
          </DialogClose>
        </div>

        <div className="flex flex-col gap-4 px-4 pt-6 pb-4">
          <div className="border-b border-primary-200">
            <textarea
              ref={titleRef}
              data-testid="task-title-input"
              rows={1}
              value={title}
              placeholder="Write a new task"
              onChange={(e) => {
                setTitle(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              className="w-full resize-none bg-transparent pb-1.5 text-sm text-black/87 outline-none placeholder:text-primary-400"
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <ChipTrigger
                testid="chip-team"
                selected={Boolean(team)}
                icon={<TeamIcon className="size-3 text-primary-400" />}
                label={team ? team.label : "Team"}
              />
              <DropdownMenuContent
                data-testid="team-menu"
                sideOffset={4}
                className={menuClasses}
              >
                {teams.map((t) => {
                  const Icon = teamIcons[t.id.toLowerCase()] || Users;
                  return (
                    <DropdownMenuItem
                      key={t.id}
                      data-testid={`team-option-${t.id}`}
                      className={menuItemClasses}
                      onClick={() => {
                        setTeamId(t.id);
                        if (!t.statuses.some((s) => s.id === statusId)) {
                          setStatusId(null);
                        }
                      }}
                    >
                      <Icon className="size-3 text-primary-400" />
                      {t.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <ChipTrigger
                testid="chip-status"
                selected={Boolean(status)}
                icon={<Inbox className="size-3 text-primary-400" />}
                label={status ? status.label : "Status"}
              />
              <DropdownMenuContent
                data-testid="status-menu"
                sideOffset={4}
                className={menuClasses}
              >
                {(statusSource?.statuses ?? []).map((s) => (
                  <DropdownMenuItem
                    key={s.id}
                    data-testid={`status-option-${s.id}`}
                    className={menuItemClasses}
                    onClick={() => {
                      if (!team && statusSource) setTeamId(statusSource.id);
                      setStatusId(s.id);
                    }}
                  >
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu open={dueOpen} onOpenChange={setDueOpen}>
              <ChipTrigger
                testid="chip-due"
                selected={Boolean(due)}
                icon={<Calendar className="size-3 text-primary-400" />}
                label={due ? formatDue(due) : "Due Date"}
                labelClass={due ? "text-primary-400" : undefined}
              />
              <DropdownMenuContent
                data-testid="due-calendar"
                sideOffset={4}
                className="w-[250px] min-w-0 rounded-[12px] p-0 ring-primary-100 shadow-none"
              >
                <p className="px-4 pt-2.5 text-lg font-medium text-primary-600">
                  {(due ?? new Date()).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <CalendarPicker
                  mode="single"
                  selected={due ?? undefined}
                  onSelect={(d) => {
                    if (d) {
                      setDue(d);
                      setDueOpen(false);
                    }
                  }}
                  defaultMonth={due ?? undefined}
                  weekStartsOn={1}
                  disableNavigation
                  showOutsideDays
                  formatters={{
                    formatWeekdayName: (d) =>
                      d
                        .toLocaleDateString("en-US", { weekday: "narrow" })
                        .toLowerCase(),
                    formatDay: (d) => d.getDate().toString().padStart(2, "0"),
                  }}
                  className={cn(
                    "w-full bg-transparent p-2.5 [--cell-size:calc(var(--cell-step)*7.5)]",
                    "[&_button[data-day]]:rounded-full [&_button[data-day]]:text-[10px] [&_button[data-day]]:text-primary-600 [&_button[data-day]:hover]:bg-primary-100",
                    "[&_button[data-day][data-selected-single=true]]:bg-[#2d4644] [&_button[data-day][data-selected-single=true]]:text-white",
                    "[&_.rdp-outside_button[data-day]]:text-primary-300",
                  )}
                  classNames={{
                    nav: "hidden",
                    month_caption: "hidden",
                    month: "flex w-full flex-col gap-1",
                    weekday: "flex-1 text-[10px] font-normal text-primary-600",
                    week: "mt-0 flex w-full",
                    today: "bg-transparent",
                  }}
                />
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <ChipTrigger
                testid="chip-priority"
                selected={Boolean(priority)}
                icon={<Flag className="size-3 text-primary-400" />}
                label={priority ?? "Priority"}
              />
              <DropdownMenuContent
                data-testid="priority-menu"
                align="end"
                sideOffset={4}
                className={menuClasses}
              >
                {priorities.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    data-testid={`priority-option-${p.id.toLowerCase()}`}
                    className={menuItemClasses}
                    onClick={() => setPriority(p.id)}
                  >
                    <span
                      data-testid={`priority-swatch-${p.id.toLowerCase()}`}
                      className={cn("size-3 rounded-[4px]", p.swatch)}
                    />
                    {p.id}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <ChipTrigger
                testid="chip-assignee"
                selected={Boolean(assignee)}
                icon={<UserIcon className="size-3 text-primary-400" />}
                label={assignee ? assignee.name : "Assign to"}
              />
              <DropdownMenuContent
                data-testid="assignee-menu"
                align="end"
                sideOffset={4}
                className={menuClasses}
              >
                {users.map((u, i) => (
                  <DropdownMenuItem
                    key={u.email}
                    data-testid={`assignee-option-${i}`}
                    className={menuItemClasses}
                    onClick={() => setAssignee(u)}
                  >
                    <Avatar size="sm" className="size-5!">
                      <AvatarImage src={u.src} alt={u.name} />
                    </Avatar>
                    {u.name}
                    {i === 0 && " (Me)"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex justify-end rounded-b-[16px] border-t border-primary-100 bg-primary-50 px-4 py-3">
          <button
            type="button"
            data-testid="add-task-submit"
            disabled={!canSubmit}
            onClick={submit}
            className={cn(
              "h-8 rounded-md px-3 text-xs text-white transition-colors outline-none",
              canSubmit
                ? "cursor-pointer bg-secondary-400 hover:bg-secondary-400/90"
                : "bg-secondary-50",
            )}
          >
            Add Task
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChipTrigger({
  testid,
  selected,
  icon,
  label,
  labelClass,
}: {
  testid: string;
  selected: boolean;
  icon: ReactNode;
  label: string;
  labelClass?: string;
}) {
  return (
    <DropdownMenuTrigger
      data-testid={testid}
      data-selected={selected || undefined}
      className={cn(
        "flex h-8 flex-1 cursor-pointer items-center justify-center gap-1 rounded-md border border-primary-200 px-3 transition-colors outline-none",
        selected ? "bg-primary-200" : "bg-white hover:bg-primary-100",
      )}
    >
      {icon}
      <span className={cn("truncate text-xs text-primary-500", labelClass)}>
        {label}
      </span>
    </DropdownMenuTrigger>
  );
}
