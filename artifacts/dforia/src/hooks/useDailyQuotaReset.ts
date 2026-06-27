import { useEffect } from "react";
import { MenuItem } from "../contexts/CartContext";

const RESET_DATE_KEY = "dforia_quota_reset_date";

export function useDailyQuotaReset() {
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const lastReset = localStorage.getItem(RESET_DATE_KEY);

    if (lastReset === today) return;

    try {
      const raw = localStorage.getItem("dforia_menu");
      if (!raw) return;
      const menuItems: MenuItem[] = JSON.parse(raw);
      const updated = menuItems.map(item => {
        if (!item.dailyQuota || item.dailyQuota <= 0) return item;
        const wasClosedByQuota = !item.isAvailable && (item.soldToday ?? 0) >= item.dailyQuota;
        return {
          ...item,
          soldToday: 0,
          isAvailable: wasClosedByQuota ? true : item.isAvailable,
        };
      });
      localStorage.setItem("dforia_menu", JSON.stringify(updated));
      localStorage.setItem(RESET_DATE_KEY, today);
    } catch {
    }
  }, []);
}
