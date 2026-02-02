import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { Card, CardHeader } from "@/components/common";
import { useTranslation } from "react-i18next";
import type { TrendAnalysis } from "@/services/utils/trendAnalysis";

interface TrendAnalysisCardProps {
  analysis: TrendAnalysis;
  prediction?: {
    predictedDirection: "up" | "down" | "sideways";
    confidence: number;
    predictedPrice?: number;
  };
}

export function TrendAnalysisCard({
  analysis,
  prediction,
}: TrendAnalysisCardProps) {
  const { t } = useTranslation();

  const trendConfig = {
    up: {
      label: t("trend.up"),
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    down: {
      label: t("trend.down"),
      icon: TrendingDown,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    sideways: {
      label: t("trend.sideways"),
      icon: Minus,
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-800",
    },
  };

  const config = trendConfig[analysis.direction];
  const TrendIcon = config.icon;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800 animate-fade-in">
      <CardHeader
        title={t("trend.analysis")}
        subtitle={t("trend.subtitle")}
        action={
          <Activity
            size={18}
            className="text-purple-500 dark:text-purple-400"
          />
        }
      />
      <div className="space-y-4">
        {/* Current Trend */}
        <div className={`rounded-xl p-4 ${config.bgColor}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendIcon size={20} className={config.color} />
              <span className={`font-semibold ${config.color}`}>
                {config.label}
              </span>
            </div>
            <div
              className={`px-3 py-1 rounded-full ${config.bgColor} ${config.color}`}
            >
              <span className="font-medium">{analysis.strength}%</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("trend.strength")}: {analysis.strength}%
          </p>
        </div>

        {/* Support & Resistance */}
        {(analysis.supportLevel || analysis.resistanceLevel) && (
          <div className="grid grid-cols-2 gap-3">
            {analysis.supportLevel && (
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t("trend.support")}
                </p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  ${analysis.supportLevel.toFixed(2)}
                </p>
              </div>
            )}
            {analysis.resistanceLevel && (
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t("trend.resistance")}
                </p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  ${analysis.resistanceLevel.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Moving Averages */}
        {(analysis.sma20 || analysis.sma50 || analysis.sma200) && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("trend.movingAverages")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {analysis.sma20 && (
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    SMA 20
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    ${analysis.sma20.toFixed(2)}
                  </p>
                </div>
              )}
              {analysis.sma50 && (
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    SMA 50
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    ${analysis.sma50.toFixed(2)}
                  </p>
                </div>
              )}
              {analysis.sma200 && (
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    SMA 200
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    ${analysis.sma200.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prediction */}
        {prediction && (
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 border border-purple-200 dark:border-purple-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {t("trend.prediction")}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {prediction.predictedDirection === "up" ? (
                  <TrendingUp
                    size={16}
                    className="text-green-600 dark:text-green-400"
                  />
                ) : prediction.predictedDirection === "down" ? (
                  <TrendingDown
                    size={16}
                    className="text-red-600 dark:text-red-400"
                  />
                ) : (
                  <Minus
                    size={16}
                    className="text-gray-600 dark:text-gray-400"
                  />
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {trendConfig[prediction.predictedDirection].label}
                </span>
              </div>
              <div className="text-right">
                {prediction.predictedPrice && (
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    ${prediction.predictedPrice.toFixed(2)}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("trend.confidence")}: {prediction.confidence}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
