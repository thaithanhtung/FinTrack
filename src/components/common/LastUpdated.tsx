import { Clock, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toVietnamTime } from "@/services/utils";
import { useEffect, useState } from "react";

interface LastUpdatedProps {
  timestamp: Date; // API data timestamp (not used for staleness check)
  fetchedAt?: Date; // When data was fetched (used for staleness check)
  showWarning?: boolean;
  warningThresholdMinutes?: number;
}

function formatTime(date: Date, locale: string): string {
  // Convert to Vietnam timezone
  const vnDate = toVietnamTime(date);

  return vnDate.toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

export function LastUpdated({
  timestamp,
  fetchedAt,
  showWarning = true,
  warningThresholdMinutes = 2, // Default 2 minutes
}: LastUpdatedProps) {
  const { t, i18n } = useTranslation();
  const [now, setNow] = useState(new Date());

  // Update "now" every second for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Use fetchedAt if available, otherwise fallback to timestamp
  const checkTime = fetchedAt || timestamp;
  const diffMinutes = (now.getTime() - checkTime.getTime()) / (1000 * 60);
  const isStale = diffMinutes > warningThresholdMinutes;

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {isStale && showWarning ? (
        <>
          <AlertTriangle
            size={12}
            className="text-amber-500 dark:text-amber-400"
          />
          <span className="text-amber-600 dark:text-amber-400">
            {t("price.staleData")} - {Math.floor(diffMinutes)} phút trước (
            {formatTime(checkTime, i18n.language)})
          </span>
        </>
      ) : (
        <>
          <Clock size={12} className="text-green-500 dark:text-green-400" />
          <span className="text-gray-600 dark:text-gray-400">
            {t("price.realTime")}:{" "}
            <span className="font-medium text-green-600 dark:text-green-400">
              {formatTime(checkTime, i18n.language)} (VN)
            </span>
          </span>
        </>
      )}
    </div>
  );
}
