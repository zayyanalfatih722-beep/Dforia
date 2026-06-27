import React, { useState } from "react";
import { Search } from "lucide-react";
import { CategoryFilter } from "../components/CategoryFilter";
import { MenuCard } from "../components/MenuCard";
import { SkeletonGrid } from "../components/SkeletonCard";
import { useListMenuItems } from "@workspace/api-client-react";
import { MenuItem } from "../contexts/CartContext";

export default function Menu() {
  const { data: apiItems, isLoading } = useListMenuItems();
  const menuItems = (apiItems ?? []) as unknown as MenuItem[];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredMenu = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full pb-8">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-4 shadow-sm">
        <h1 className="font-serif text-2xl font-bold text-center text-foreground mb-4">Semua Menu</h1>
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Cari menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="-mx-4">
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>
      </header>

      <div className="px-4 mt-6">
        {isLoading ? (
          <SkeletonGrid count={6} />
        ) : (
          <>
            {filteredMenu.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {filteredMenu.map((item, idx) => (
                  <MenuCard key={item.id} item={item} index={idx} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Tidak ada menu yang ditemukan.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
