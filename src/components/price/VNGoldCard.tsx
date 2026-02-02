import { MapPin } from "lucide-react";
import {
  Card,
  CardHeader,
  LastUpdated,
  ErrorMessage,
  VNGoldCardSkeleton,
} from "@/components/common";
import { useVNGoldPrices } from "@/hooks";
import { formatVND, getBrandName } from "@/services/utils";
import { useTranslation } from "react-i18next";
import type { VNGoldPrice } from "@/types";

interface PriceRowProps {
  item: VNGoldPrice;
}

function PriceRow({ item }: PriceRowProps) {
  const { t } = useTranslation();
  const spread = item.sellPrice - item.buyPrice;

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 animate-fade-in">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {getBrandName(item.brand)}
          </span>
          {item.region && (
            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-0.5">
              <MapPin size={10} />
              {item.region}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t("price.spread")}: {formatVND(spread)} đ
        </p>
      </div>
      <div className="text-right">
        <div className="flex gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("price.buyPrice")}
            </p>
            <p className="font-semibold text-gray-700 dark:text-gray-300 price-value">
              {formatVND(item.buyPrice / 1000)}K
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("price.sellPrice")}
            </p>
            <p className="font-semibold text-gold-600 dark:text-gold-400 price-value">
              {formatVND(item.sellPrice / 1000)}K
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VNGoldCard() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useVNGoldPrices();

  if (isLoading) {
    return <VNGoldCardSkeleton />;
  }

  if (isError || !data) {
    return (
      <Card>
        <ErrorMessage message={t("price.errorVN")} onRetry={refetch} />
      </Card>
    );
  }

  // Group by gold type
  const sjcPrices = data.filter((p) => p.type === "SJC");
  const nhanPrices = data.filter((p) => p.type === "NHAN_9999");

  return (
    <div className="space-y-4">
      {/* SJC */}
      <Card>
        <CardHeader
          title={t("price.sjc")}
          subtitle={t("price.sjcDescription")}
        />
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {sjcPrices.map((item, index) => (
            <PriceRow key={`sjc-${index}`} item={item} />
          ))}
        </div>
        {sjcPrices[0] && <LastUpdated timestamp={sjcPrices[0].timestamp} />}
      </Card>

      {/* Nhẫn 9999 */}
      <Card>
        <CardHeader
          title={t("price.nhan9999")}
          subtitle={t("price.nhan9999Description")}
        />
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {nhanPrices.map((item, index) => (
            <PriceRow key={`nhan-${index}`} item={item} />
          ))}
        </div>
        {nhanPrices[0] && <LastUpdated timestamp={nhanPrices[0].timestamp} />}
      </Card>
    </div>
  );
}
