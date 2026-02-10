import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  fetchAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  toggleAlert,
} from "@/services/api/alertsApi";
import type { PriceAlert, GoldType, AlertCondition, GoldBrand } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export function useAlerts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch alerts (RLS will automatically filter by user_id)
  const {
    data: alerts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["alerts", user?.id],
    queryFn: () => fetchAlerts(),
    enabled: !!user,
    staleTime: 30000, // 30 seconds
  });

  // Create alert mutation
  const createMutation = useMutation({
    mutationFn: async (
      newAlert: Omit<PriceAlert, "id" | "userId" | "createdAt" | "triggeredAt">
    ) => {
      if (!user) {
        throw new Error("You must be logged in to create alerts");
      }

      // Get user's telegram chat ID from profile
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("telegram_chat_id")
        .eq("id", user.id)
        .single();

      return createAlert({
        ...newAlert,
        userId: user.id,
        telegramChatId: profile?.telegram_chat_id || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts", user?.id] });
    },
  });

  // Update alert mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<
        Pick<PriceAlert, "isActive" | "targetPrice" | "condition">
      >;
    }) => updateAlert(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts", user?.id] });
    },
  });

  // Delete alert mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts", user?.id] });
    },
  });

  // Toggle alert mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleAlert(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts", user?.id] });
    },
  });

  // Helper functions
  const addAlert = (
    goldType: GoldType | "XAU",
    condition: AlertCondition,
    targetPrice: number,
    brand?: GoldBrand
  ) => {
    if (!user) {
      throw new Error("You must be logged in to create alerts");
    }
    return createMutation.mutateAsync({
      goldType,
      condition,
      targetPrice,
      brand,
      isActive: true,
    });
  };

  const removeAlert = (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  const toggleAlertStatus = (id: string) => {
    const alert = alerts.find((a) => a.id === id);
    if (alert) {
      return toggleMutation.mutateAsync({ id, isActive: !alert.isActive });
    }
  };

  const activeAlerts = alerts.filter((a) => a.isActive);
  const triggeredAlerts = alerts.filter((a) => a.triggeredAt);

  return {
    alerts,
    activeAlerts,
    triggeredAlerts,
    isLoading,
    error,
    addAlert,
    removeAlert,
    toggleAlert: toggleAlertStatus,
    refetch,
    isAuthenticated: !!user,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
