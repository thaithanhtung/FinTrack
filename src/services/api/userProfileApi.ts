import { supabase } from "@/lib/supabase";
import type { UserProfile, UserProfileDB } from "@/types";

// Transform DB record to UserProfile
function transformProfile(dbProfile: UserProfileDB): UserProfile {
  return {
    id: dbProfile.id,
    email: dbProfile.email,
    telegramChatId: dbProfile.telegram_chat_id,
    telegramUsername: dbProfile.telegram_username,
    dailyReportEnabled: dbProfile.daily_report_enabled ?? true,
    reportTime: dbProfile.report_time ?? "07:00:00",
    createdAt: new Date(dbProfile.created_at),
    updatedAt: new Date(dbProfile.updated_at),
  };
}

/**
 * Fetch user profile
 */
export async function fetchUserProfile(
  userId: string
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // Profile might not exist yet, which is okay
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching user profile:", error);
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    return data ? transformProfile(data) : null;
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    throw error;
  }
}

/**
 * Update Telegram chat ID in user profile
 */
export async function updateTelegramChatId(
  userId: string,
  chatId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({
        telegram_chat_id: chatId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error updating telegram chat ID:", error);
      throw new Error(`Failed to update telegram chat ID: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in updateTelegramChatId:", error);
    throw error;
  }
}

/**
 * Update daily report settings
 */
export async function updateDailyReportSettings(
  userId: string,
  settings: {
    enabled?: boolean;
    reportTime?: string;
  }
): Promise<void> {
  try {
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (settings.enabled !== undefined) {
      updates.daily_report_enabled = settings.enabled;
    }

    if (settings.reportTime) {
      updates.report_time = settings.reportTime;
    }

    const { error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("id", userId);

    if (error) {
      console.error("Error updating daily report settings:", error);
      throw new Error(
        `Failed to update daily report settings: ${error.message}`
      );
    }
  } catch (error) {
    console.error("Error in updateDailyReportSettings:", error);
    throw error;
  }
}

/**
 * Create or update user profile
 */
export async function upsertUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  try {
    const { error } = await supabase.from("user_profiles").upsert({
      id: userId,
      ...updates,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error upserting user profile:", error);
      throw new Error(`Failed to upsert user profile: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in upsertUserProfile:", error);
    throw error;
  }
}
