import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const CATEGORIES = [
  "All",
  "Makanan Berat",
  "Makanan Ringan",
  "Minuman",
  "Dessert",
  "Paket Hemat"
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex w-max space-x-3 p-4 pt-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              selected === category
                ? "bg-primary text-primary-foreground shadow-md scale-105"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  );
}
