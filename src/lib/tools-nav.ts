import { CalendarClock, LayoutDashboard, Mail, NotebookPen, type LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  url: "/" | "/email" | "/meeting-notes" | "/task-planner";
  icon: LucideIcon;
  description: string;
};

export const DASHBOARD_ITEM: NavItem = {
  title: "Dashboard",
  url: "/",
  icon: LayoutDashboard,
  description: "Your WorkLekker AI home.",
};

export const TOOL_ITEMS: NavItem[] = [
  {
    title: "Smart Email Generator",
    url: "/email",
    icon: Mail,
    description: "Turn a few key points into a polished email in the tone you need.",
  },
  {
    title: "Meeting Notes Summarizer",
    url: "/meeting-notes",
    icon: NotebookPen,
    description: "Paste messy notes and get clear decisions, action items and deadlines.",
  },
  {
    title: "AI Task Planner",
    url: "/task-planner",
    icon: CalendarClock,
    description: "Tag tasks by urgency and importance to get a prioritized daily schedule.",
  },
];

export const NAV_ITEMS: NavItem[] = [DASHBOARD_ITEM, ...TOOL_ITEMS];
