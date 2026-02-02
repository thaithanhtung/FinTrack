import { Card, CardHeader } from "@/components/common";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";

interface StatisticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  tooltip?: string;
  className?: string;
}

export function StatisticsCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  tooltip,
  className = "",
}: StatisticsCardProps) {
  const trendColors = {
    up: "text-up dark:text-green-400",
    down: "text-down dark:text-red-400",
    neutral: "text-gray-500 dark:text-gray-400",
  };

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <Card className={`animate-fade-in ${className}`}>
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <span>{title}</span>
            {tooltip && (
              <div className="group relative">
                <Info
                  size={14}
                  className="text-gray-400 dark:text-gray-500 cursor-help"
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap shadow-lg">
                    {tooltip}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        }
        action={icon}
      />
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          {trend && trendValue && (
            <div
              className={`flex items-center gap-1 text-sm ${trendColors[trend]}`}
            >
              <TrendIcon size={14} />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
    </Card>
  );
}
