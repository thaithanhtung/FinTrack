import {
  Bell,
  BellOff,
  Trash2,
  TrendingUp,
  TrendingDown,
  Check,
} from "lucide-react";
import { Card, CardHeader } from "@/components/common";
import { useAlerts } from "@/hooks";
import { formatVND, formatUSD, getGoldTypeName } from "@/services/utils";
import { useTranslation } from "react-i18next";
import type { PriceAlert } from "@/types";

interface AlertItemProps {
  alert: PriceAlert;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

function AlertItem({ alert, onToggle, onRemove }: AlertItemProps) {
  const { t } = useTranslation();
  const isWorldGold = alert.goldType === "XAU";
  const ConditionIcon = alert.condition === "ABOVE" ? TrendingUp : TrendingDown;
  const conditionColor =
    alert.condition === "ABOVE"
      ? "text-up dark:text-green-400"
      : "text-down dark:text-red-400";
  const conditionBg =
    alert.condition === "ABOVE"
      ? "bg-up/10 dark:bg-green-900/30"
      : "bg-down/10 dark:bg-red-900/30";

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return t("time.justNow");
    if (diffMins < 60) return t("time.minutesAgo", { count: diffMins });

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return t("time.hoursAgo", { count: diffHours });

    const diffDays = Math.floor(diffHours / 24);
    return t("time.daysAgo", { count: diffDays });
  };

  return (
    <div
      className={`p-3 rounded-xl border ${
        alert.isActive
          ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {getGoldTypeName(alert.goldType)}
            </span>
            {alert.triggeredAt && (
              <span className="flex items-center gap-1 text-xs text-up dark:text-green-400 bg-up/10 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                <Check size={12} />
                {t("alerts.triggered")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 text-sm ${conditionColor} ${conditionBg} px-2 py-0.5 rounded-full`}
            >
              <ConditionIcon size={14} />
              {alert.condition === "ABOVE"
                ? t("alerts.above")
                : t("alerts.below")}
            </span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {isWorldGold
                ? formatUSD(alert.targetPrice)
                : formatVND(alert.targetPrice) + " đ"}
            </span>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {t("alerts.created")} {formatTimeAgo(alert.createdAt)}
            {alert.triggeredAt &&
              ` • ${t("alerts.triggeredAt")} ${formatTimeAgo(
                alert.triggeredAt
              )}`}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggle(alert.id)}
            className={`p-2 rounded-lg transition-colors ${
              alert.isActive
                ? "text-gold-600 dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-gold-900/30"
                : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title={
              alert.isActive
                ? t("alerts.toggleTooltip")
                : t("alerts.toggleTooltipActive")
            }
          >
            {alert.isActive ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
          <button
            onClick={() => onRemove(alert.id)}
            className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            title={t("alerts.deleteTooltip")}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AlertList() {
  const { t } = useTranslation();
  const { alerts, toggleAlert, removeAlert } = useAlerts();

  const activeAlerts = alerts.filter((a) => a.isActive);
  const inactiveAlerts = alerts.filter((a) => !a.isActive);

  if (alerts.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Bell size={28} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            {t("alerts.noAlerts")}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {t("alerts.noAlertsDescription")}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activeAlerts.length > 0 && (
        <Card>
          <CardHeader
            title={t("alerts.activeAlerts")}
            subtitle={t("alerts.alertCount", { count: activeAlerts.length })}
          />
          <div className="space-y-2">
            {activeAlerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onToggle={toggleAlert}
                onRemove={removeAlert}
              />
            ))}
          </div>
        </Card>
      )}

      {inactiveAlerts.length > 0 && (
        <Card>
          <CardHeader
            title={t("alerts.inactiveAlerts")}
            subtitle={t("alerts.alertCount", { count: inactiveAlerts.length })}
          />
          <div className="space-y-2">
            {inactiveAlerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onToggle={toggleAlert}
                onRemove={removeAlert}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
