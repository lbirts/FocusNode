"use client";

import { cn } from "@/app/lib/utils";
import { Button } from "@/ui/button";
import { Card, CardAction, CardHeader } from "@/ui/card";
import { Separator } from "@/ui/separator";
import { Switch } from "@/ui/switch";
import {
  CheckCircle2,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Settings,
  SkipForward,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Mode = "focus" | "short" | "long";

const presets: { mode: Mode; minutes: number; label: string }[] = [
  { mode: "focus", minutes: 25, label: "Focus Time" },
  { mode: "short", minutes: 5, label: "Short Break" },
  { mode: "long", minutes: 15, label: "Long Break" },
];

const defaultBlocking = {
  "Twitter / X": true,
  YouTube: true,
  Reddit: true,
  Slack: false,
  Email: true,
  "News sites": true,
};

const TICK_COUNT = 24;

function ClockDial({ progress }: { progress: number }) {
  const activeTicks = Math.round(progress * TICK_COUNT);
  return (
    <svg
      viewBox="0 0 300 300"
      className="size-[300px]"
      data-testid="clock-dial"
      aria-hidden
    >
      {Array.from({ length: TICK_COUNT }).map((_, i) => {
        const isActive = i < activeTicks;
        const angle = (i / TICK_COUNT) * 360;
        return (
          <line
            key={i}
            data-testid={`dial-tick-${isActive ? "active" : "inactive"}`}
            x1="150"
            y1="10"
            x2="150"
            y2={isActive ? 36 : 28}
            stroke={
              isActive ? "var(--color-brand)" : "var(--color-primary-300)"
            }
            strokeWidth={isActive ? 3 : 2}
            strokeLinecap="round"
            transform={`rotate(${angle} 150 150)`}
          />
        );
      })}
    </svg>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function FocusTimer() {
  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [blockingEnabled, setBlockingEnabled] = useState(true);
  const [blocked, setBlocked] =
    useState<Record<string, boolean>>(defaultBlocking);

  const currentPreset = useMemo(
    () => presets.find((p) => p.mode === mode)!,
    [mode],
  );
  const totalSeconds = currentPreset.minutes * 60;
  const progress = 1 - secondsLeft / totalSeconds;
  const modeLabel = {
    focus: "FOCUS SESSION",
    short: "SHORT BREAK",
    long: "LONG BREAK",
  }[mode];

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setIsRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  function selectMode(next: Mode) {
    const preset = presets.find((p) => p.mode === next)!;
    setMode(next);
    setSecondsLeft(preset.minutes * 60);
    setIsRunning(false);
  }

  function restart() {
    setSecondsLeft(totalSeconds);
    setIsRunning(false);
  }

  function skip() {
    const idx = presets.findIndex((p) => p.mode === mode);
    const next = presets[(idx + 1) % presets.length];
    selectMode(next.mode);
  }

  return (
    <div className="h-full w-full flex">
      <div className="bg-primary-50 h-full flex-1 flex flex-col">
        <div
          data-testid="page-header"
          className="border-b border-primary-200 px-3 py-4.5 flex justify-between gap-2"
        >
          <div className="flex gap-2 items-center">
            <h3
              data-testid="page-title"
              className="text-lg text-primary-600 font-medium"
            >
              Focus Timer
            </h3>
            <Separator orientation="vertical" />
            <p
              data-testid="muted-text-sample"
              className="text-primary-400 text-sm"
            >
              Pomodoro
            </p>
            <Separator orientation="vertical" />
            {/* TODO: Update with dynamic count */}
            <p className="text-primary-400 text-sm">Session 5 of 8</p>
            <Separator orientation="vertical" />
            {/* TODO: Update with dynamic time */}
            <p className="text-primary-400 text-sm">2h 35m elapsed</p>
          </div>
          <Button className="text-primary-400" size="icon-sm" variant="outline">
            <Settings />
          </Button>
        </div>

        <div className="flex flex-1 min-h-0 flex-col items-center gap-10 overflow-y-auto px-3 pt-12 pb-12">
          <div
            data-testid="focus-timer-presets"
            className="flex items-center justify-center gap-2"
          >
            {presets.map(({ mode: m, minutes, label }) => {
              const active = m === mode;
              return (
                <Button
                  key={m}
                  data-testid={`timer-preset-${m}`}
                  size="lg"
                  onClick={() => selectMode(m)}
                  className={cn(
                    "gap-3 rounded-xl p-5 h-19.5",
                    active ? "border-brand" : "hover:border-primary-300",
                  )}
                >
                  <p className="text-3xl font-semibold text-secondary-400">
                    {minutes}
                  </p>
                  <p className="text-xs text-primary-500">{label}</p>
                </Button>
              );
            })}
          </div>

          <div className="relative flex size-[300px] items-center justify-center">
            <ClockDial progress={progress} />
            <div className="absolute flex flex-col items-center gap-2">
              <p className="text-xs text-primary-500">{modeLabel}</p>
              <p
                data-testid="timer-countdown"
                className="text-3xl font-semibold text-secondary-400 tabular-nums"
              >
                {formatTime(secondsLeft)}
              </p>
            </div>
          </div>

          <div
            data-testid="timer-controls"
            className="flex items-center justify-center gap-4"
          >
            <Button
              variant="outline"
              size="icon"
              data-testid="timer-restart"
              className="size-10 rounded-full border-primary-300"
              onClick={restart}
              aria-label="Restart"
            >
              <RotateCcw />
            </Button>
            <Button
              variant="orange"
              size="icon-lg"
              data-testid="timer-play"
              className="size-14 rounded-full"
              onClick={() => setIsRunning((r) => !r)}
              aria-label={isRunning ? "Pause" : "Play"}
            >
              {isRunning ? (
                <Pause className="size-5 fill-current" />
              ) : (
                <Play className="size-5 fill-current" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              data-testid="timer-skip"
              className="size-10 rounded-full border-primary-300"
              onClick={skip}
              aria-label="Skip"
            >
              <SkipForward />
            </Button>
          </div>

          <div className="flex w-full items-center justify-center gap-4">
            <Card
              size="sm"
              className="w-[429px] rounded-xl border border-primary-200 bg-white"
            >
              <CardHeader className="gap-y-3">
                <div className="flex items-center justify-between">
                  <p
                    data-testid="eyebrow-label"
                    className="text-xs font-medium uppercase text-primary-400"
                  >
                    Currently working on
                  </p>
                  <div className="flex items-center gap-2 rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-400">
                    <CheckCircle2 className="size-4" />
                    Mark As Completed
                  </div>
                </div>
                <p className="text-sm text-primary-500">
                  Build notification preferences panel
                </p>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-secondary-50 px-1.5 py-0.5 text-xs text-secondary-400">
                    Normal
                  </span>
                  <span className="rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-400">
                    Engineering
                  </span>
                </div>
              </CardHeader>
            </Card>
            <Button variant="outline" size="sm">
              Next task
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>

      <aside className="py-5 px-3 w-[300px] border-l border-primary-200 bg-primary-100">
        <h3 className="text-lg text-primary-600 font-medium">
          Distraction Blocker
        </h3>
        <Card size="sm" className="rounded-md border border-primary-200 my-5">
          <CardHeader className="gap-y-0">
            Blocking enabled
            <CardAction>
              <Switch
                checked={blockingEnabled}
                onCheckedChange={setBlockingEnabled}
              />
            </CardAction>
          </CardHeader>
        </Card>
        <div
          className={cn(
            "space-y-1 transition-opacity",
            !blockingEnabled && "pointer-events-none opacity-50",
          )}
        >
          {Object.entries(blocked).map(([label, enabled]) => (
            <Card
              key={label}
              size="sm"
              className="rounded-md border border-primary-200"
            >
              <CardHeader className="gap-y-0">
                {label}
                <CardAction>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(v) =>
                      setBlocked((prev) => ({ ...prev, [label]: v }))
                    }
                  />
                </CardAction>
              </CardHeader>
            </Card>
          ))}
        </div>
      </aside>
    </div>
  );
}
