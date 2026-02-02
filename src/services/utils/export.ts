import type { PriceHistoryPoint } from "@/types";

/**
 * Export dữ liệu giá thành CSV
 */
export function exportToCSV(
  data: PriceHistoryPoint[],
  filename: string = "gold-price-history.csv"
): void {
  if (data.length === 0) {
    alert("Không có dữ liệu để xuất");
    return;
  }

  // Tạo header CSV
  const headers = [
    "Ngày",
    "Giờ",
    "Giá (USD/oz)",
    "Giá mở",
    "Giá cao",
    "Giá thấp",
    "Giá đóng",
  ];

  // Tạo rows
  const rows = data.map((point) => {
    const date = new Date(point.timestamp);
    const dateStr = date.toLocaleDateString("vi-VN");
    const timeStr = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return [
      dateStr,
      timeStr,
      point.price.toFixed(2),
      point.open?.toFixed(2) || "",
      point.high?.toFixed(2) || "",
      point.low?.toFixed(2) || "",
      point.close?.toFixed(2) || "",
    ];
  });

  // Combine headers và rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Tạo BOM cho UTF-8 để Excel hiển thị đúng tiếng Việt
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  // Tạo link download
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export VN gold prices to CSV
 */
export function exportVNGoldToCSV(
  data: Array<{
    date: Date;
    goldType: string;
    brand: string;
    buyPrice: number;
    sellPrice: number;
  }>,
  filename: string = "vn-gold-price-history.csv"
): void {
  if (data.length === 0) {
    alert("Không có dữ liệu để xuất");
    return;
  }

  const headers = [
    "Ngày",
    "Loại vàng",
    "Thương hiệu",
    "Giá mua (VNĐ)",
    "Giá bán (VNĐ)",
    "Chênh lệch (VNĐ)",
  ];

  const rows = data.map((item) => {
    const date = new Date(item.date);
    const dateStr = date.toLocaleDateString("vi-VN");
    const spread = item.sellPrice - item.buyPrice;

    return [
      dateStr,
      item.goldType,
      item.brand,
      item.buyPrice.toLocaleString("vi-VN"),
      item.sellPrice.toLocaleString("vi-VN"),
      spread.toLocaleString("vi-VN"),
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export statistics to JSON
 */
export function exportStatisticsToJSON(
  statistics: Record<string, unknown>,
  filename: string = "gold-statistics.json"
): void {
  const jsonContent = JSON.stringify(statistics, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
