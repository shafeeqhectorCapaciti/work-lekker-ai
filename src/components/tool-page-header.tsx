import type { LucideIcon } from "lucide-react";

export function ToolPageHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <header className="mb-6 flex items-start gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p>
      </div>
    </header>
  );
}
