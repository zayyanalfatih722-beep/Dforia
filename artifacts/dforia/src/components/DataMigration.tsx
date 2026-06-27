import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  listMenuItems, createMenuItem,
  listBanners, createBanner,
  updateSettings,
  listCoupons, createCoupon,
  getListMenuItemsQueryKey,
  getListBannersQueryKey,
  getGetSettingsQueryKey,
  getListCouponsQueryKey,
} from "@workspace/api-client-react";
import { SEED_MENU, SEED_BANNERS } from "../hooks/useSeedData";

const MIGRATION_KEY = "dforia_migrated_v1";

export function DataMigration() {
  const qc = useQueryClient();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const alreadyMigrated = localStorage.getItem(MIGRATION_KEY) === "true";

        // Always sync settings from localStorage → API on every load
        const lsSettings = (() => {
          try { return JSON.parse(localStorage.getItem("dforia_settings") || "null"); } catch { return null; }
        })();
        if (lsSettings?.storeName) {
          await updateSettings(lsSettings).catch(() => {});
          qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        }

        if (alreadyMigrated) return;

        // Migrate menu
        const apiMenu = await listMenuItems().catch(() => [] as typeof SEED_MENU);
        if (apiMenu.length === 0) {
          const lsMenu: typeof SEED_MENU = (() => {
            try { return JSON.parse(localStorage.getItem("dforia_menu") || "[]"); } catch { return []; }
          })();
          const menuToSeed = lsMenu.length > 0 ? lsMenu : SEED_MENU;
          for (const item of menuToSeed) {
            await createMenuItem(item as Parameters<typeof createMenuItem>[0]).catch(() => {});
          }
          qc.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
        }

        // Migrate banners
        const apiBanners = await listBanners().catch(() => []);
        if (apiBanners.length === 0) {
          const lsBanners: typeof SEED_BANNERS = (() => {
            try { return JSON.parse(localStorage.getItem("dforia_banners") || "[]"); } catch { return []; }
          })();
          const bannersToSeed = lsBanners.length > 0 ? lsBanners : SEED_BANNERS;
          for (let i = 0; i < bannersToSeed.length; i++) {
            await createBanner({ ...bannersToSeed[i], sortOrder: i } as Parameters<typeof createBanner>[0]).catch(() => {});
          }
          qc.invalidateQueries({ queryKey: getListBannersQueryKey() });
        }

        // Migrate coupons
        const apiCoupons = await listCoupons().catch(() => []);
        if (apiCoupons.length === 0) {
          const lsCoupons: unknown[] = (() => {
            try { return JSON.parse(localStorage.getItem("dforia_coupons") || "[]"); } catch { return []; }
          })();
          for (const c of lsCoupons) {
            await createCoupon(c as Parameters<typeof createCoupon>[0]).catch(() => {});
          }
          qc.invalidateQueries({ queryKey: getListCouponsQueryKey() });
        }

        localStorage.setItem(MIGRATION_KEY, "true");
      } catch (e) {
        console.error("DataMigration error:", e);
      }
    })();
  }, []);

  return null;
}
