import { useState } from "react";
import { Calculator, ChevronDown } from "lucide-react";
import {
  Card,
  CardHeader,
  ErrorMessage,
  ConverterSkeleton,
} from "@/components/common";
import { useVNGoldPrices, useExchangeRate } from "@/hooks";
import { formatVND, formatUSD } from "@/services/utils";
import { useTranslation } from "react-i18next";

// Đơn vị vàng Việt Nam
type GoldUnit = "phan" | "chi" | "cay";

export default function Converter() {
  const { t } = useTranslation();
  const {
    data: vnPrices,
    isLoading: isLoadingVN,
    isError: isErrorVN,
    refetch: refetchVN,
  } = useVNGoldPrices();
  const { data: exchangeRate, isLoading: isLoadingRate } = useExchangeRate();

  const [amount, setAmount] = useState("1");
  const [selectedUnit, setSelectedUnit] = useState<GoldUnit>("chi");
  const [selectedGoldType, setSelectedGoldType] = useState("SJC");
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const goldUnits: { value: GoldUnit; label: string; ratio: number }[] = [
    { value: "phan", label: t("converter.phan"), ratio: 0.1 },
    { value: "chi", label: t("converter.chi"), ratio: 1 },
    { value: "cay", label: t("converter.luong"), ratio: 10 },
  ];

  const goldTypes = [
    { value: "SJC", label: t("price.sjc") },
    { value: "NHAN_9999", label: t("price.nhan9999") },
  ];

  // Lấy giá bán hiện tại của loại vàng được chọn
  const getCurrentSellPrice = (): number | null => {
    if (!vnPrices || vnPrices.length === 0) return null;

    const goldPrice = vnPrices.find((p) => p.type === selectedGoldType);
    return goldPrice?.sellPrice || null;
  };

  const sellPrice = getCurrentSellPrice();
  const selectedUnitInfo = goldUnits.find((u) => u.value === selectedUnit)!;

  // Tính giá trị quy đổi
  const calculateValue = (): { vnd: number; usd: number } | null => {
    if (!sellPrice || !amount) return null;

    const qty = parseFloat(amount);
    if (isNaN(qty) || qty <= 0) return null;

    // Giá bán là giá 1 lượng (10 chỉ)
    // 1 chỉ = sellPrice / 10
    const pricePerChi = sellPrice / 10;

    // Tính theo đơn vị được chọn
    const totalVND = pricePerChi * selectedUnitInfo.ratio * qty;

    // Quy đổi sang USD
    const totalUSD = exchangeRate ? totalVND / exchangeRate.usdToVnd : 0;

    return {
      vnd: Math.round(totalVND),
      usd: Math.round(totalUSD * 100) / 100,
    };
  };

  const result = calculateValue();

  // Loading state
  if (isLoadingVN || isLoadingRate) {
    return <ConverterSkeleton />;
  }

  // Error state
  if (isErrorVN) {
    return (
      <div className="space-y-4">
        <Card>
          <ErrorMessage message={t("price.errorVN")} onRetry={refetchVN} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Giá hiện tại */}
      {sellPrice && (
        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("price.sellPrice")}{" "}
                {selectedGoldType === "SJC"
                  ? t("price.sjc")
                  : t("price.nhan9999")}{" "}
                {t("common.loading")}
              </p>
              <p className="text-xl font-bold text-amber-700 dark:text-amber-300">
                {formatVND(sellPrice)} {t("price.vndPerLuong")}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                = {formatVND(sellPrice / 10)} đ/
                {t("converter.chi").toLowerCase()}
              </p>
            </div>
            <div className="text-right text-xs text-gray-500 dark:text-gray-400">
              <p>
                1 {t("converter.luong").toLowerCase()} = 10{" "}
                {t("converter.chi").toLowerCase()}
              </p>
              <p>
                1 {t("converter.chi").toLowerCase()} = 10{" "}
                {t("converter.phan").toLowerCase()}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Converter */}
      <Card>
        <CardHeader
          title={t("converter.title")}
          subtitle={t("converter.subtitle")}
          action={
            <Calculator
              size={18}
              className="text-gold-500 dark:text-gold-400"
            />
          }
        />

        <div className="space-y-4">
          {/* Chọn loại vàng */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("converter.selectGoldType")}
            </label>
            <div className="relative">
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-left flex items-center justify-between text-gray-900 dark:text-gray-100"
              >
                <span className="font-medium">
                  {
                    goldTypes.find((type) => type.value === selectedGoldType)
                      ?.label
                  }
                </span>
                <ChevronDown
                  size={20}
                  className="text-gray-400 dark:text-gray-500"
                />
              </button>
              {showTypeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
                  {goldTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        setSelectedGoldType(type.value);
                        setShowTypeDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-xl last:rounded-b-xl ${
                        selectedGoldType === type.value
                          ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Input số lượng và đơn vị */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("converter.amount")}
            </label>
            <div className="flex gap-2">
              {/* Input số */}
              <input
                type="text"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value.replace(/[^0-9.]/g, ""))
                }
                placeholder="1"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gold-500 dark:focus:ring-gold-400 focus:border-gold-500 dark:focus:border-gold-400 text-lg font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />

              {/* Dropdown đơn vị */}
              <div className="relative">
                <button
                  onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 flex items-center gap-2 min-w-[140px] justify-between text-gray-900 dark:text-gray-100"
                >
                  <span className="font-medium">{selectedUnitInfo.label}</span>
                  <ChevronDown
                    size={20}
                    className="text-gray-400 dark:text-gray-500"
                  />
                </button>
                {showUnitDropdown && (
                  <div className="absolute z-10 right-0 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
                    {goldUnits.map((unit) => (
                      <button
                        key={unit.value}
                        onClick={() => {
                          setSelectedUnit(unit.value);
                          setShowUnitDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-xl last:rounded-b-xl ${
                          selectedUnit === unit.value
                            ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                            : "text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {unit.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nút tính nhanh */}
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 5, 10].map((num) => (
              <button
                key={num}
                onClick={() => setAmount(num.toString())}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  amount === num.toString()
                    ? "bg-gold-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {num} {selectedUnitInfo.label}
              </button>
            ))}
          </div>

          {/* Kết quả */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t("converter.value")} {amount || "0"}{" "}
              {selectedUnitInfo.label.toLowerCase()}{" "}
              {selectedGoldType === "SJC"
                ? t("price.sjc")
                : t("price.nhan9999")}
            </p>

            {result ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {formatVND(result.vnd)}
                  </span>
                  <span className="text-lg text-green-600 dark:text-green-400">
                    VNĐ
                  </span>
                </div>

                {exchangeRate && (
                  <div className="flex items-baseline gap-2 text-gray-600 dark:text-gray-400">
                    <span className="text-lg font-semibold">
                      ≈ {formatUSD(result.usd)}
                    </span>
                    <span className="text-sm">USD</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                ---
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Bảng quy đổi nhanh */}
      <Card>
        <CardHeader
          title={t("converter.conversionTable")}
          subtitle={`${t("price.sellPrice")} ${
            selectedGoldType === "SJC" ? t("price.sjc") : t("price.nhan9999")
          }`}
        />

        {sellPrice ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">
                    {t("converter.amount")}
                  </th>
                  <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">
                    {t("converter.value")} (VNĐ)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 text-gray-700 dark:text-gray-300">
                    1 {t("converter.phan").toLowerCase()}
                  </td>
                  <td className="py-2 text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatVND(sellPrice / 100)} đ
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 text-gray-700 dark:text-gray-300">
                    1 {t("converter.chi").toLowerCase()}
                  </td>
                  <td className="py-2 text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatVND(sellPrice / 10)} đ
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 text-gray-700 dark:text-gray-300">
                    5 {t("converter.chi").toLowerCase()}
                  </td>
                  <td className="py-2 text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatVND(sellPrice / 2)} đ
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-amber-50 dark:bg-amber-900/30">
                  <td className="py-2 font-medium text-gray-900 dark:text-gray-100">
                    1 {t("converter.luong").toLowerCase()}
                  </td>
                  <td className="py-2 text-right font-bold text-amber-700 dark:text-amber-300">
                    {formatVND(sellPrice)} đ
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 text-gray-700 dark:text-gray-300">
                    2 {t("converter.luong").toLowerCase()}
                  </td>
                  <td className="py-2 text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatVND(sellPrice * 2)} đ
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-700 dark:text-gray-300">
                    5 {t("converter.luong").toLowerCase()}
                  </td>
                  <td className="py-2 text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatVND(sellPrice * 5)} đ
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            {t("converter.noData")}
          </p>
        )}
      </Card>

      {/* Giải thích đơn vị */}
      <Card>
        <CardHeader title={t("converter.unitExplanation")} />
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span>{t("converter.luong")}</span>
            <span className="font-medium">{t("converter.luongEquals")}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span>{t("converter.chi")}</span>
            <span className="font-medium">{t("converter.chiEquals")}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>{t("converter.phan")}</span>
            <span className="font-medium">{t("converter.phanEquals")}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
