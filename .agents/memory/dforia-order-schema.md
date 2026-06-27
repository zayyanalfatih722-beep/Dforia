---
name: D'Foria Order Schema
description: TypeScript type quirks for order items in generated API types
---

## Rule
`OrderItems` and `OrderInputItems` are typed as `{ [key: string]: unknown }` in generated code, NOT as arrays. To use them as arrays, always cast via `unknown` first.

**Why:** Orval generates JSONB types as generic objects. The actual runtime value is an array of `{ menuItem: { id, name, price, ... }, quantity: number }`.

**How to apply:**
- Reading items: `(o.items as unknown as any[]).map(...)`
- Writing items from cart: `cart as unknown as { [key: string]: unknown }`
- Do NOT use `as any[]` directly — TS will complain about type overlap

## Hook options caveat
Generated hooks like `useListOrders({ query: { refetchInterval: 30000 } })` fail to compile because `UseQueryOptions` requires `queryKey` as mandatory field. Either omit refetchInterval or pass the full queryKey from `getListOrdersQueryKey()`.
