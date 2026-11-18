import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, Mail, NotebookPen, Sparkles } from "lucide-react";

import heroImage from "@/assets/hero-glow.jpg";
import { Button } from "@/components/ui/button";
import { TOOL_ITEMS } from "@/lib/tools-nav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WorkLekker AI — Dashboard" },
      {
        name: "description",
        content:
          "Automate workplace tasks: write emails, summarize meetings and plan your day with WorkLekker AI.",
      },
      { property: "og:title", content: "WorkLekker AI — Your AI workplace assistant" },
      {
        property: "og:description",
        content: "Write emails, summarize meetings and plan your day in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-border shadow-card">
        <img
          src={heroImage}
          alt=""
          width={1600}
          height={800}
          className="absolute inset-0 h-full w-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-hero" aria-hidden />
        <div className="relative max-w-3xl px-6 py-12 md:px-12 md:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Powered by Lovable AI
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-foreground md:text-5xl">
            Work smarter.{" "}
            <span className="text-gradient-primary">Let AI handle the busywork.</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            WorkLekker AI drafts your emails, turns messy meeting notes into clear next steps and
            plans your day — so you can focus on the work that matters.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/email">
                <Mail /> Write an email
              </Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/meeting-notes">
                <NotebookPen /> Summarize a meeting
              </Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/task-planner">
                <CalendarClock /> Plan my day
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground">Productivity tools</h2>
        <p className="mt-1 text-sm text-muted-foreground">Pick a tool to get started.</p>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {TOOL_ITEMS.map((tool) => (
            <Link
              key={tool.url}
              to={tool.url}
              className="surface-card group flex flex-col rounded-2xl p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                <tool.icon className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{tool.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {tool.description}
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                Open tool
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
