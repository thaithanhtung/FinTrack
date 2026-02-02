import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatPercent, formatPriceChange } from "@/services/utils";

interface PriceChangeProps {
  change: number;
  changePercent: number;
  isVND?: boolean;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PriceChange({
  change,
  changePercent,
  isVND = false,
  showIcon = true,
  size = "md",
}: PriceChangeProps) {
  const isPositive = change > 0;
  const isNegative = change < 0;

  const colorClass = isPositive
    ? "text-up dark:text-green-400"
    : isNegative
    ? "text-down dark:text-red-400"
    : "text-gray-500 dark:text-gray-400";

  const bgClass = isPositive
    ? "bg-up/10 dark:bg-green-900/30"
    : isNegative
    ? "bg-down/10 dark:bg-red-900/30"
    : "bg-gray-100 dark:bg-gray-800";

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSize = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full ${bgClass} ${sizeClasses[size]} ${colorClass} font-medium animate-scale-in transition-transform duration-200 hover:scale-105`}
    >
      {showIcon && <Icon size={iconSize[size]} className="animate-fade-in" />}
      <span className="animate-fade-in">{formatPercent(changePercent)}</span>
      {!isVND && <span className="text-gray-400 dark:text-gray-500">|</span>}
      {!isVND && (
        <span className="animate-fade-in">
          {formatPriceChange(change, isVND)}
        </span>
      )}
    </div>
  );
}
