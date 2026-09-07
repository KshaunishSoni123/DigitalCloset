"use client";

import {createClient} from "@/lib/supabase/client";
import { useState } from "react";

type EquippedState = {
    hat: any | null;
    top: any | null;
    bottom: any | null;
    shoes: any | null;
    accessory: any | null;
};

const CATEGORIES = [
  { key: "hat", label: "Hats", id: "slot-hat" },
  { key: "top", label: "Tops", id: "slot-top" },
  { key: "bottom", label: "Bottoms", id: "slot-bottom" },
  { key: "shoes", label: "Shoes", id: "slot-shoes" },
  { key: "accessory", label: "Accessories", id: "slot-accessory" },
];

export default function ClosetUI({ clothes }: { clothes: any[] }) {
  const [equipped, setEquipped] = useState<EquippedState>({
    hat: null, top: null, bottom: null, shoes: null, accessory: null
  });
  const supabase = createClient();

  const getImageUrl = (path: string) => supabase.storage.from('closet_images').getPublicUrl(path).data.publicUrl;

  const toggleEquip = (categoryKey: keyof EquippedState, item: any) => {
    setEquipped(prev => ({
      ...prev,
      [categoryKey]: prev[categoryKey]?.id === item.id ? null : item
    }));
  };

  return (
    <div className="max-w-3xl mx-auto px-5">
      <div className="flex justify-center my-7">
        <div className="stage">
          {CATEGORIES.map(cat => {
            const item = equipped[cat.key as keyof EquippedState];
            return (
              <div key={cat.id} id={cat.id} className={`slot ${item ? 'filled' : ''}`}>
                {item ? <img src={getImageUrl(item.image_path)} alt="equipped" /> : null}
              </div>
            );
          })}
          <div id="slot-head" className="slot">🙂</div>
        </div>
      </div>
      
      <p className="text-center text-xs text-[#b8a8d9] mb-6">tap an item below to try it on</p>

      {CATEGORIES.map(cat => {
        // Filter your real DB items by this category
        const itemsInCategory = clothes.filter(c => c.category.toLowerCase() === cat.key);
        if (itemsInCategory.length === 0) return null;

        return (
          <div key={cat.key} className="mb-5">
            <p className="text-[13px] tracking-wider text-[#05d9e8] uppercase mb-2">{cat.label}</p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {itemsInCategory.map(item => {
                const isSelected = equipped[cat.key as keyof EquippedState]?.id === item.id;
                return (
                  <div 
                    key={item.id} 
                    onClick={() => toggleEquip(cat.key as keyof EquippedState, item)}
                    className={`item-card flex-none w-20 rounded-[10px_10px_4px_4px] overflow-hidden cursor-pointer ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="h-14 w-full">
                      <img src={getImageUrl(item.image_path)} className="w-full h-full object-cover" alt="clothing" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}