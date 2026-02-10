import type { PriceAlert } from "@/types";

const OLD_STORAGE_KEY = "fintrack_alerts";
const MIGRATED_FLAG_KEY = "fintrack_alerts_migrated";

interface OldPriceAlert {
  id: string;
  goldType: string;
  brand?: string;
  condition: "ABOVE" | "BELOW";
  targetPrice: number;
  isActive: boolean;
  createdAt: string | Date;
  triggeredAt?: string | Date;
}

/**
 * Check if alerts have been migrated
 */
export function hasAlreadyMigrated(): boolean {
  try {
    return localStorage.getItem(MIGRATED_FLAG_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Mark migration as completed
 */
export function markMigrationComplete(): void {
  try {
    localStorage.setItem(MIGRATED_FLAG_KEY, "true");
  } catch (error) {
    console.error("Error marking migration complete:", error);
  }
}

/**
 * Get old alerts from localStorage
 */
export function getOldAlerts(): OldPriceAlert[] {
  try {
    const stored = localStorage.getItem(OLD_STORAGE_KEY);
    if (!stored) return [];

    const alerts = JSON.parse(stored);
    return Array.isArray(alerts) ? alerts : [];
  } catch (error) {
    console.error("Error reading old alerts:", error);
    return [];
  }
}

/**
 * Clear old alerts from localStorage after successful migration
 */
export function clearOldAlerts(): void {
  try {
    localStorage.removeItem(OLD_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing old alerts:", error);
  }
}

/**
 * Transform old alert to new format
 */
export function transformOldAlert(
  oldAlert: OldPriceAlert,
  telegramChatId: string
): Omit<PriceAlert, "id" | "createdAt" | "triggeredAt"> {
  return {
    telegramChatId,
    goldType: oldAlert.goldType as any,
    brand: oldAlert.brand as any,
    condition: oldAlert.condition,
    targetPrice: oldAlert.targetPrice,
    isActive: oldAlert.isActive,
  };
}

/**
 * Main migration function
 * Returns number of alerts migrated
 */
export async function migrateAlertsToSupabase(
  telegramChatId: string,
  createAlertFn: (
    alert: Omit<PriceAlert, "id" | "createdAt" | "triggeredAt">
  ) => Promise<PriceAlert>
): Promise<{ success: number; failed: number; total: number }> {
  if (hasAlreadyMigrated()) {
    return { success: 0, failed: 0, total: 0 };
  }

  const oldAlerts = getOldAlerts();
  if (oldAlerts.length === 0) {
    markMigrationComplete();
    return { success: 0, failed: 0, total: 0 };
  }

  let success = 0;
  let failed = 0;

  for (const oldAlert of oldAlerts) {
    try {
      const newAlert = transformOldAlert(oldAlert, telegramChatId);
      await createAlertFn(newAlert);
      success++;
    } catch (error) {
      console.error("Error migrating alert:", oldAlert, error);
      failed++;
    }
  }

  // Only mark as migrated and clear if all succeeded
  if (failed === 0) {
    clearOldAlerts();
    markMigrationComplete();
  }

  return {
    success,
    failed,
    total: oldAlerts.length,
  };
}

/**
 * Get migration status and alert count
 */
export function getMigrationStatus(): {
  needsMigration: boolean;
  alertCount: number;
  alreadyMigrated: boolean;
} {
  const alreadyMigrated = hasAlreadyMigrated();
  const oldAlerts = getOldAlerts();

  return {
    needsMigration: !alreadyMigrated && oldAlerts.length > 0,
    alertCount: oldAlerts.length,
    alreadyMigrated,
  };
}
