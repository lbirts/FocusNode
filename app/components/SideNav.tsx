"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { boards } from "@/app/lib/boards";
import { cn } from "@/app/lib/utils";
import {
  Calendar,
  ChevronDown,
  LayoutGrid,
  Timer,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const navItems = [
  { href: "/", label: "Kanban Boards", icon: LayoutGrid, expandable: true },
  { href: "/focus-timer", label: "Focus Timer", icon: Timer },
  { href: "/daily-planner", label: "Daily Planner", icon: Calendar },
  { href: "/team", label: "Team Workload", icon: Users },
];

export default function SideNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeBoardId = searchParams.get("board") ?? boards[0].id;

  return (
    <aside className="flex w-fit shrink-0 flex-col self-stretch border-r border-primary-200">
      <div className="px-4 py-3 border-b border-primary-200 flex items-center gap-2">
        <Avatar>
          <AvatarImage
            src="https://github.com/shadcn.png"
            alt="User profile pic"
          />
          <AvatarFallback>AM</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-primary-600 text-lg">Alex Morgan</p>
          <p className="text-primary-400 text-sm">alex@focusnode.io</p>
        </div>
        <ChevronDown className="size-5 text-primary-400" />
      </div>
      <div className="px-3 py-4 flex flex-col">
        {navItems.map(({ href, label, icon: Icon, expandable }) => {
          const isActive =
            pathname === href ||
            (href !== "/" && pathname.startsWith(`${href}/`));
          return (
            <div key={href}>
              <Button
                size="lg"
                variant={isActive ? "orange" : "ghost"}
                className="w-full justify-start"
                render={<Link href={href} />}
                nativeButton={false}
              >
                <Icon />
                <span className="flex-1 text-left">{label}</span>
                {expandable && isActive && <ChevronDown className="size-4" />}
              </Button>
              {expandable && isActive && (
                <div className="border-b border-primary-200 py-2 flex flex-col">
                  {boards.map((board) => {
                    const selected = board.id === activeBoardId;
                    return (
                      <Link
                        key={board.id}
                        href={`/?board=${board.id}`}
                        className={cn(
                          "h-8 px-3 flex items-center rounded-lg text-[10px]",
                          selected
                            ? "text-primary-600"
                            : "text-primary-400 hover:text-primary-600",
                        )}
                      >
                        {board.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
