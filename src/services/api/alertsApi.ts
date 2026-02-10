import { supabase } from "@/lib/supabase";
import type {
  PriceAlert,
  PriceAlertDB,
  GoldType,
  AlertCondition,
  GoldBrand,
} from "@/types";

// Transform DB record to PriceAlert
function transformAlert(dbAlert: PriceAlertDB): PriceAlert {
  return {
    id: dbAlert.id,
    userId: dbAlert.user_id,
    telegramChatId: dbAlert.telegram_chat_id,
    goldType: dbAlert.gold_type as GoldType | "XAU",
    brand: dbAlert.brand as GoldBrand | undefined,
    condition: dbAlert.condition,
    targetPrice: Number(dbAlert.target_price),
    isActive: dbAlert.is_active,
    createdAt: new Date(dbAlert.created_at),
    triggeredAt: dbAlert.triggered_at
      ? new Date(dbAlert.triggered_at)
      : undefined,
  };
}

// Transform PriceAlert to DB format
function transformToDb(
  alert: Omit<PriceAlert, "id" | "createdAt" | "triggeredAt">
): Omit<PriceAlertDB, "id" | "created_at" | "triggered_at"> {
  return {
    user_id: alert.userId,
    telegram_chat_id: alert.telegramChatId,
    gold_type: alert.goldType,
    brand: alert.brand,
    condition: alert.condition,
    target_price: alert.targetPrice,
    is_active: alert.isActive,
  };
}

/**
 * Fetch all alerts for the authenticated user
 * RLS policies will automatically filter by user_id
 */
export async function fetchAlerts(): Promise<PriceAlert[]> {
  try {
    const { data, error } = await supabase
      .from("price_alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching alerts:", error);
      throw new Error(`Failed to fetch alerts: ${error.message}`);
    }

    return (data || []).map(transformAlert);
  } catch (error) {
    console.error("Error in fetchAlerts:", error);
    throw error;
  }
}

/**
 * Create a new price alert
 */
export async function createAlert(
  alert: Omit<PriceAlert, "id" | "createdAt" | "triggeredAt">
): Promise<PriceAlert> {
  try {
    const dbAlert = transformToDb(alert);

    const { data, error } = await supabase
      .from("price_alerts")
      .insert(dbAlert as any)
      .select()
      .single();

    if (error) {
      console.error("Error creating alert:", error);
      throw new Error(`Failed to create alert: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned after creating alert");
    }

    return transformAlert(data as PriceAlertDB);
  } catch (error) {
    console.error("Error in createAlert:", error);
    throw error;
  }
}

/**
 * Update an existing alert
 */
export async function updateAlert(
  id: string,
  updates: Partial<Pick<PriceAlert, "isActive" | "targetPrice" | "condition">>
): Promise<void> {
  try {
    const dbUpdates: Partial<PriceAlertDB> = {};

    if (updates.isActive !== undefined) {
      dbUpdates.is_active = updates.isActive;
    }
    if (updates.targetPrice !== undefined) {
      dbUpdates.target_price = updates.targetPrice;
    }
    if (updates.condition !== undefined) {
      dbUpdates.condition = updates.condition;
    }

    const { error } = await supabase
      .from("price_alerts")
      .update(dbUpdates)
      .eq("id", id);

    if (error) {
      console.error("Error updating alert:", error);
      throw new Error(`Failed to update alert: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in updateAlert:", error);
    throw error;
  }
}

/**
 * Delete an alert
 */
export async function deleteAlert(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("price_alerts").delete().eq("id", id);

    if (error) {
      console.error("Error deleting alert:", error);
      throw new Error(`Failed to delete alert: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in deleteAlert:", error);
    throw error;
  }
}

/**
 * Toggle alert active status
 */
export async function toggleAlert(
  id: string,
  isActive: boolean
): Promise<void> {
  return updateAlert(id, { isActive });
}

/**
 * Get all active alerts (for checking - used by Edge Function)
 */
export async function fetchActiveAlerts(): Promise<PriceAlert[]> {
  try {
    const { data, error } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching active alerts:", error);
      throw new Error(`Failed to fetch active alerts: ${error.message}`);
    }

    return (data || []).map(transformAlert);
  } catch (error) {
    console.error("Error in fetchActiveAlerts:", error);
    throw error;
  }
}
