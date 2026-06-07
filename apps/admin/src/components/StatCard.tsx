interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  variant?: "primary" | "secondary" | "tertiary";
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  variant = "primary",
}: StatCardProps) {
  const iconColors = {
    primary: "text-primary bg-primary-container/20",
    secondary: "text-secondary bg-secondary-container/20",
    tertiary: "text-tertiary-container bg-tertiary-fixed-dim/20",
  };
  return (
    <div className="bg-surface rounded-xl p-6 border border-outline-variant shadow-sm flex flex-col justify-between relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <span className="font-label-md text-label-md text-on-surface-variant">
          {title}
        </span>
        <span
          className={`material-symbols-outlined p-2 rounded-lg ${iconColors[variant]}`}
        >
          {icon}
        </span>
      </div>
      <div className="font-headline-lg text-headline-lg text-on-surface">
        {value}
      </div>
      {trend && (
        <div className="mt-2 text-on-tertiary-container text-sm flex items-center gap-1 font-medium">
          <span className="material-symbols-outlined text-[16px]">
            trending_up
          </span>
          {trend}
        </div>
      )}
      {!trend && (
        <div className="mt-2 text-on-surface-variant text-sm flex items-center gap-1">
          Dados em tempo real
        </div>
      )}
    </div>
  );
}
