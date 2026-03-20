import CategoryCard from "@/components/CategoryCard";

const categories = [
  {
    title: "Drivers",
    description:
      "Explore lap times, race results, career statistics, and head-to-head comparisons for every driver on the grid.",
    href: "/drivers",
    icon: "🏎️",
  },
  {
    title: "Teams",
    description:
      "Dig into constructor performance, pit stop data, points tallies, and season-by-season team breakdowns.",
    href: "/teams",
    icon: "🔧",
  },
  {
    title: "Races",
    description:
      "Track race weekends with session schedules, circuit details, results, and key moments from every Grand Prix.",
    href: "/races",
    icon: "🏁",
  },
  {
    title: "Championships",
    description:
      "Follow the Drivers' and Constructors' championship standings, race calendars, and historical season results.",
    href: "/championships",
    icon: "🏆",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="w-full max-w-5xl">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: "var(--f1-red)" }}
            />
            2026 Season Live
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            F1{" "}
            <span style={{ color: "var(--f1-red)" }}>Tracker</span>
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-lg text-muted leading-relaxed">
            Your hub for Formula 1 data — drivers, teams, races, and
            championship standings all in one place.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.href} {...cat} />
          ))}
        </div>
      </div>
    </div>
  );
}

