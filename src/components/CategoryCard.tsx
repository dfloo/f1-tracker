import Link from "next/link";

interface CategoryCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

export default function CategoryCard({
  title,
  description,
  href,
  icon,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-surface p-8 transition-colors hover:border-[var(--f1-red)] hover:bg-surface-hover"
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
        style={{ backgroundColor: "rgba(225, 6, 0, 0.1)", color: "var(--f1-red)" }}
      >
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-foreground transition-colors group-hover:text-[var(--f1-red)]">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-muted">{description}</p>
      </div>
      <span className="mt-auto text-sm font-medium text-[var(--f1-red)] opacity-0 transition-opacity group-hover:opacity-100">
        Explore →
      </span>
    </Link>
  );
}
