---
name: D'Foria Admin Data Architecture
description: Admin pages use API (database), not localStorage, for orders and menu
---

## Rule
All admin pages fetch orders via `useListOrders()` and menu via `useListMenuItems()` from `@workspace/api-client-react`. Do NOT use `useLocalStorage("dforia_orders")` or `useLocalStorage("dforia_menu")` in admin pages.

**Why:** The customer checkout flow saves orders to the PostgreSQL DB via API. If admin reads localStorage, data won't match — orders placed by customers won't appear in admin panel.

**How to apply:**
- Dashboard, OrdersManage, Kasir, Keuangan, Laporan → `useListOrders()` / `useListMenuItems()`
- Expenses (Keuangan) and coupons still use localStorage — that's intentional (no DB table for them)
- API DELETE endpoints exist: `DELETE /api/orders/:id` and `DELETE /api/orders` (delete all)

## Default admin credentials
- Username: `dforia_admin`
- Password: `admin123`
(Stored in settings table, can be changed via Settings page)
