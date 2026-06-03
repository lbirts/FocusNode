export type Priority = "Urgent" | "Medium" | "Normal" | "Low";

export type Card = {
  id: number;
  title: string;
  priority: Priority;
  due?: string;
  tag: string;
  assignee: string;
};

export type Column = {
  id: string;
  title: string;
  wip?: number;
  cards: Card[];
};

export type Swimlane = {
  id: string;
  title: string;
  columns: Column[];
};

export type Board = {
  id: string;
  title: string;
  swimlanes: Swimlane[];
  memberCount: number;
};

const avatars = [
  "/avatars/avatar-1.jpg",
  "/avatars/avatar-2.jpg",
  "/avatars/avatar-3.jpg",
];

export const boards: Board[] = [
  {
    id: "product-launch-q2",
    title: "Product Launch Q2",
    memberCount: 3,
    swimlanes: [
      {
        id: "engineering",
        title: "Engineering",
        columns: [
          {
            id: "backlog",
            title: "Backlog",
            cards: [
              { id: 101, title: "Update API documentation v2.3", priority: "Urgent", due: "3/17", tag: "Docs", assignee: avatars[0] },
              { id: 102, title: "Design onboarding flow revamp", priority: "Normal", due: "3/23", tag: "Design", assignee: avatars[2] },
              { id: 103, title: "Research competitor pricing models", priority: "Low", tag: "Research", assignee: avatars[1] },
            ],
          },
          {
            id: "todo",
            title: "To Do",
            wip: 5,
            cards: [
              { id: 201, title: "Implement auth token refresh logic", priority: "Normal", due: "3/19", tag: "Engineering", assignee: avatars[0] },
              { id: 202, title: "Write unit tests for payment module", priority: "Normal", due: "3/18", tag: "Engineering", assignee: avatars[0] },
            ],
          },
          {
            id: "in-progress",
            title: "In Progress",
            wip: 3,
            cards: [
              { id: 301, title: "Build notification preferences panel", priority: "Urgent", due: "3/16", tag: "Engineering", assignee: avatars[0] },
              { id: 302, title: "Create dashboard analytics widgets", priority: "Medium", due: "3/17", tag: "Design", assignee: avatars[2] },
            ],
          },
          {
            id: "in-review",
            title: "In Review",
            wip: 2,
            cards: [
              { id: 401, title: "Migrate database to new schema", priority: "Normal", due: "3/18", tag: "Engineering", assignee: avatars[0] },
            ],
          },
          {
            id: "done",
            title: "Done",
            cards: [
              { id: 501, title: "Set up CI/CD pipeline for staging", priority: "Low", tag: "Engineering", assignee: avatars[0] },
              { id: 502, title: "Logo & brand guideline finalization", priority: "Low", tag: "Design", assignee: avatars[2] },
            ],
          },
        ],
      },
      { id: "design", title: "Design", columns: [] },
      { id: "marketing", title: "Marketing", columns: [] },
    ],
  },
  {
    id: "website-redesign",
    title: "Website Redesign",
    memberCount: 4,
    swimlanes: [
      {
        id: "design",
        title: "Design",
        columns: [
          {
            id: "todo",
            title: "To Do",
            cards: [
              { id: 1001, title: "Audit current marketing site IA", priority: "Medium", due: "3/21", tag: "Research", assignee: avatars[2] },
              { id: 1002, title: "Define new visual language tokens", priority: "Normal", due: "3/24", tag: "Design", assignee: avatars[2] },
            ],
          },
          {
            id: "in-progress",
            title: "In Progress",
            wip: 2,
            cards: [
              { id: 1003, title: "Homepage hero exploration", priority: "Urgent", due: "3/18", tag: "Design", assignee: avatars[1] },
            ],
          },
          { id: "done", title: "Done", cards: [] },
        ],
      },
      { id: "engineering", title: "Engineering", columns: [] },
    ],
  },
  {
    id: "mobile-app-upgrade",
    title: "Mobile App Upgrade",
    memberCount: 5,
    swimlanes: [
      {
        id: "engineering",
        title: "Engineering",
        columns: [
          {
            id: "backlog",
            title: "Backlog",
            cards: [
              { id: 2001, title: "Upgrade React Native to 0.74", priority: "Medium", tag: "Engineering", assignee: avatars[0] },
              { id: 2002, title: "Replace deprecated AsyncStorage usage", priority: "Low", tag: "Engineering", assignee: avatars[0] },
            ],
          },
          {
            id: "in-progress",
            title: "In Progress",
            wip: 2,
            cards: [
              { id: 2003, title: "Biometric login flow", priority: "Urgent", due: "3/15", tag: "Engineering", assignee: avatars[1] },
            ],
          },
          { id: "done", title: "Done", cards: [] },
        ],
      },
    ],
  },
  {
    id: "user-experience-audit",
    title: "User Experience Audit",
    memberCount: 2,
    swimlanes: [
      {
        id: "research",
        title: "Research",
        columns: [
          {
            id: "todo",
            title: "To Do",
            cards: [
              { id: 3001, title: "Recruit 8 participants for usability study", priority: "Medium", due: "3/22", tag: "Research", assignee: avatars[2] },
            ],
          },
          {
            id: "in-progress",
            title: "In Progress",
            wip: 1,
            cards: [
              { id: 3002, title: "Heuristic review of checkout flow", priority: "Normal", due: "3/19", tag: "Research", assignee: avatars[1] },
            ],
          },
        ],
      },
    ],
  },
];

export function getBoard(id: string | undefined | null): Board {
  return boards.find((b) => b.id === id) ?? boards[0];
}
