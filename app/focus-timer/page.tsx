"use client";

import { cn } from "@/app/lib/utils";
import { Button } from "@/ui/button";
import { Card, CardAction, CardHeader } from "@/ui/card";
import { Separator } from "@/ui/separator";
import { Switch } from "@/ui/switch";
import confetti from "canvas-confetti";
import {
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Frown,
  Pause,
  Play,
  RotateCcw,
  Settings,
  SkipForward,
} from "lucide-react";
import { motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

type Mode = "focus" | "short" | "long";

const presets: { mode: Mode; minutes: number; label: string }[] = [
  { mode: "focus", minutes: 25, label: "Focus Time" },
  { mode: "short", minutes: 5, label: "Short Break" },
  { mode: "long", minutes: 15, label: "Long Break" },
];

const sessionTasks = [
  {
    title: "Build notification preferences panel",
    priority: "Normal",
    tag: "Engineering",
  },
  {
    title: "Create dashboard analytics widgets",
    priority: "Medium",
    tag: "Design",
  },
  { title: "Wire up onboarding checklist", priority: "Normal", tag: "Design" },
];

const taskChipStyles: Record<string, string> = {
  Normal: "bg-secondary-50 text-secondary-400",
  Medium: "bg-brand-light text-brand",
};

// Share of the session after which the dial starts pulsating.
const PULSE_THRESHOLD = 0.95;

// Concentric 6px rings around the 300px dial, innermost faintest (Figma 103:869-872)
const PULSE_RINGS = [
  { inset: -16, color: "var(--color-brand-light)", opacity: 0.3 },
  { inset: -22, color: "var(--color-brand-light)", opacity: 1 },
  { inset: -28, color: "#ffe3d4", opacity: 1 },
  { inset: -33, color: "#ffd6c0", opacity: 1 },
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
            y2={isActive ? 40 : 32}
            stroke={
              isActive ? "var(--color-brand)" : "var(--color-primary-300)"
            }
            strokeWidth={isActive ? 3 : 2}
            strokeLinecap="round"
            transform={`rotate(${angle} 150 150)`}
            className="transition-all duration-200"
          />
        );
      })}
    </svg>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function FocusTimerPage() {
  return (
    <Suspense
      fallback={<div className="h-full w-full bg-primary-50" aria-hidden />}
    >
      <FocusTimer />
    </Suspense>
  );
}

function FocusTimer() {
  const searchParams = useSearchParams();
  const seededSeconds = (() => {
    if (searchParams.get("finished") === "1") return 0;
    const raw = Number(searchParams.get("seconds"));
    return Number.isInteger(raw) && raw > 0 && raw <= 25 * 60 ? raw : null;
  })();

  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(seededSeconds ?? 25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [blockingEnabled, setBlockingEnabled] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [blocked, setBlocked] =
    useState<Record<string, boolean>>(defaultBlocking);
  const [taskIndex, setTaskIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confettiFired = useRef(searchParams.get("finished") === "1");

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
  const currentTask = sessionTasks[taskIndex % sessionTasks.length];
  const nextTask = sessionTasks[(taskIndex + 1) % sessionTasks.length];
  const finished = secondsLeft === 0;
  const nearEnd = isRunning && !finished && progress >= PULSE_THRESHOLD;

  useEffect(() => {
    if (!finished) {
      confettiFired.current = false;
      return;
    }
    if (confettiFired.current) return;
    confettiFired.current = true;
    confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
    const timer = window.setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0 } });
      confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1 } });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [finished]);

  const elapsedMinutes = Math.max(
    1,
    Math.round((totalSeconds - secondsLeft) / 60),
  );

  function endSession() {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
    setIsCompleted(false);
    setConfirmOpen(false);
  }

  function switchTask() {
    setTaskIndex((i) => i + 1);
    setIsCompleted(false);
    setConfirmOpen(false);
  }

  function startBreak() {
    selectMode("short");
    setIsRunning(true);
  }

  function startNewSession() {
    setTaskIndex((i) => i + 1);
    setIsCompleted(false);
    selectMode("focus");
    setIsRunning(true);
  }

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
          {finished ? (
            <motion.div
              data-testid="timer-finished"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex w-full flex-col items-center gap-6 pt-4"
            >
              <span className="flex size-11 items-center justify-center rounded-full border-2 border-green-600">
                <Check className="size-5 text-green-600" />
              </span>
              <div className="flex flex-col items-center gap-2">
                <h2 className="text-2xl font-semibold uppercase text-secondary-400">
                  Focus session complete!
                </h2>
                <p className="text-sm text-primary-500">Great work, Alex!</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                {[
                  { value: formatTime(totalSeconds), label: "Focus Time" },
                  { value: isCompleted ? "1" : "0", label: "Task Completed" },
                  { value: "5 of 8", label: "Session Today" },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="flex h-19.5 items-center gap-3 rounded-xl border border-primary-200 bg-white p-5"
                  >
                    <p className="text-3xl font-semibold text-secondary-400">
                      {value}
                    </p>
                    <p className="text-xs text-primary-500">{label}</p>
                  </div>
                ))}
              </div>
              <Card
                size="sm"
                className="w-[560px] rounded-xl border border-primary-200 bg-white"
              >
                <CardHeader className="gap-y-2">
                  <p className="text-xs font-medium uppercase text-brand">
                    Next task
                  </p>
                  <p
                    data-testid="next-task-title"
                    className="text-sm text-primary-500"
                  >
                    {nextTask.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-xs",
                          taskChipStyles[nextTask.priority],
                        )}
                      >
                        {nextTask.priority}
                      </span>
                      <span className="rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-400">
                        {nextTask.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid="start-break"
                        onClick={startBreak}
                      >
                        Start Break
                      </Button>
                      <Button
                        variant="orange"
                        size="sm"
                        data-testid="start-new-session"
                        onClick={startNewSession}
                      >
                        Start New Focus Session
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ) : (
            <>
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
                {nearEnd && (
                  <span
                    data-testid="timer-pulse"
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                  >
                    {PULSE_RINGS.map((ring, i) => (
                      <motion.span
                        key={i}
                        data-testid="timer-pulse-ring"
                        className="absolute rounded-full border-[6px]"
                        style={{ inset: ring.inset, borderColor: ring.color }}
                        animate={{
                          opacity: [
                            ring.opacity * 0.25,
                            ring.opacity,
                            ring.opacity * 0.25,
                          ],
                          scale: [0.97, 1.02, 0.97],
                        }}
                        transition={{
                          duration: 1.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.18,
                        }}
                      />
                    ))}
                  </span>
                )}
                <ClockDial progress={progress} />
                <div className="absolute flex flex-col items-center gap-2">
                  <p className="text-xs text-primary-500">{modeLabel}</p>
                  <p
                    data-testid="timer-countdown"
                    className="text-3xl font-semibold tabular-nums text-secondary-400"
                  >
                    {formatTime(secondsLeft)}
                  </p>
                  {confirmOpen && (
                    <Frown className="size-5 text-primary-400" aria-hidden />
                  )}
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

              {confirmOpen ? (
                <motion.div
                  data-testid="end-session-card"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <Card
                    size="sm"
                    className="w-[360px] rounded-xl border border-primary-200 bg-white shadow-[2px_4px_40px_10px_rgba(31,53,51,0.08)]"
                  >
                    <div className="flex flex-col items-center gap-3 p-4">
                      <div className="flex items-center gap-2">
                        <span className="flex size-5 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                          ?
                        </span>
                        <p className="text-base font-semibold text-secondary-400">
                          End current focus session?
                        </p>
                      </div>
                      <p className="text-xs text-primary-400">
                        You&apos;ve been focusing for {elapsedMinutes} min
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid="end-session"
                          onClick={endSession}
                        >
                          End Session
                        </Button>
                        <Button
                          variant="orange"
                          size="sm"
                          data-testid="switch-task"
                          onClick={switchTask}
                        >
                          Switch Task
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : (
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
                        {isCompleted ? (
                          <div className="flex items-center gap-2 rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-600">
                            <CheckCircle2 className="size-4" />
                            Complete
                          </div>
                        ) : (
                          <Button
                            size="xs"
                            data-testid="mark-completed"
                            className="gap-2 rounded px-1.5 py-0.5"
                            onClick={() => setIsCompleted(true)}
                          >
                            <CheckCheck className="size-4" />
                            Mark As Completed
                          </Button>
                        )}
                      </div>
                      <p
                        data-testid="current-task-title"
                        className="text-sm text-primary-500"
                      >
                        {currentTask.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-xs",
                            taskChipStyles[currentTask.priority],
                          )}
                        >
                          {currentTask.priority}
                        </span>
                        <span className="rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-400">
                          {currentTask.tag}
                        </span>
                      </div>
                    </CardHeader>
                  </Card>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="next-task"
                    onClick={() => setConfirmOpen(true)}
                    className={cn(isCompleted && "animate-bounce")}
                  >
                    Next task
                    <ChevronRight />
                  </Button>
                </div>
              )}
            </>
          )}
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
                data-testid="blocking-switch"
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
