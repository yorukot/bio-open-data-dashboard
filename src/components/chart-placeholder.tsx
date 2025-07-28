import { BarChart3, LineChart, PieChart, TrendingUp } from "lucide-react";

interface ChartPlaceholderProps {
  title: string;
  description?: string;
  type?: "bar" | "line" | "pie" | "trend";
  className?: string;
}

const chartIcons = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  trend: TrendingUp,
};

export function ChartPlaceholder({
  title,
  description,
  type = "bar",
  className = "",
}: ChartPlaceholderProps) {
  const Icon = chartIcons[type];

  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">{title}</h3>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        )}
        <div className="h-64 bg-muted/20 rounded-md flex items-center justify-center">
          <div className="text-center">
            <Icon className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Chart placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
}