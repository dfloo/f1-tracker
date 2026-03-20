import Link from 'next/link';

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
      className="group border-border bg-surface hover:bg-surface-hover flex flex-col gap-4 rounded-xl border p-8 transition-colors hover:border-[var(--f1-red)]"
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
        style={{
          backgroundColor: 'rgba(225, 6, 0, 0.1)',
          color: 'var(--f1-red)',
        }}
      >
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-foreground text-xl font-semibold transition-colors group-hover:text-[var(--f1-red)]">
          {title}
        </h2>
        <p className="text-muted text-sm leading-relaxed">{description}</p>
      </div>
      <span className="mt-auto text-sm font-medium text-[var(--f1-red)] opacity-0 transition-opacity group-hover:opacity-100">
        Explore →
      </span>
    </Link>
  );
}
