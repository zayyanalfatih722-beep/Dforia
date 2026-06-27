import React from "react";
import { Link, useLocation } from "wouter";
import { House, UtensilsCrossed, ShoppingCart, ClipboardList, User } from "lucide-react";
import { useCart } from "../contexts/CartContext";

export function BottomNav() {
  const [location] = useLocation();
  const { cartCount } = useCart();

  const navItems = [
    { href: "/", icon: House, label: "Home" },
    { href: "/menu", icon: UtensilsCrossed, label: "Menu" },
    { href: "/cart", icon: ShoppingCart, label: "Cart", badge: cartCount },
    { href: "/orders", icon: ClipboardList, label: "Orders" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe">
      <div className="w-full max-w-[430px] bg-background/80 backdrop-blur-xl border-t border-border flex justify-around items-center h-16 px-4 pb-2 pt-2 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center w-16 h-full transition-all duration-300">
              <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full animate-in zoom-in">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-all duration-300 mt-0.5 ${isActive ? "text-primary opacity-100 translate-y-0" : "text-muted-foreground opacity-70 translate-y-0.5"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
