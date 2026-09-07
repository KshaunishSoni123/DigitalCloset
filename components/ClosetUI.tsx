"use client";

import {createClient} from "@/lib/supabase/client";
import { createPortal } from "react-dom";
import { UpdateClothingItem } from "@/app/backend/closet";
import { deleteClothingItem } from "@/app/backend/closet";
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

  // Edit State
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editCategory, setEditCategory] = useState("top");
  const [editDesc, setEditDesc] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Un-equip the item if we are editing/deleting it so the avatar doesn't get stuck
  const clearFromAvatar = () => {
    setEquipped(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        if (newState[key as keyof EquippedState]?.id === editingItem?.id) newState[key as keyof EquippedState] = null;
      });
      return newState;
    });
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setEditCategory(item.category.toLowerCase());
    setEditDesc(item.description || "");
  };

  const handleUpdate = async () => {
    setIsProcessing(true);
    try {
      await UpdateClothingItem(editingItem.id, editCategory, editDesc);
      clearFromAvatar(); // Forces user to re-equip from the correct row
      setEditingItem(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await deleteClothingItem(editingItem.id, editingItem.image_path);
      clearFromAvatar();
      setEditingItem(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-5">
      <div className="flex justify-center my-7">
        <div className="stage">
          {CATEGORIES.map(cat => {
            const item = equipped[cat.key as keyof EquippedState];
            return (
              <div key={cat.id} id={cat.id} className={`slot ${item ? 'filled' : ''}`}>
                {item && <img src={getImageUrl(item.image_path)} alt="equipped" />}
              </div>
            );
          })}
          <div id="slot-head" className="slot"></div>
        </div>
      </div>
      
      <p className="text-center text-xs text-[var(--text-dim)] mb-6">tap an item below to try it on</p>

      {CATEGORIES.map(cat => {
        const itemsInCategory = clothes.filter(c => c.category.toLowerCase() === cat.key);
        if (itemsInCategory.length === 0) return null;

        return (
          <div key={cat.key} className="mb-5">
            <p className="text-[13px] tracking-wider text-[var(--cyan)] uppercase mb-2">{cat.label}</p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {itemsInCategory.map(item => {
                const isSelected = equipped[cat.key as keyof EquippedState]?.id === item.id;
                return (
                  <div 
                    key={item.id} 
                    onClick={() => toggleEquip(cat.key as keyof EquippedState, item)}
                    // Added "relative" so the edit button positions correctly inside it
                    className={`relative item-card flex-none w-20 rounded-[10px_10px_4px_4px] overflow-hidden cursor-pointer ${isSelected ? 'selected' : ''}`}
                  >
                    {/* The Edit Trigger Button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); openEdit(item); }}
                      className="absolute top-1 right-1 bg-[var(--void)]/80 hover:bg-[var(--pink)] border border-[var(--panel-2)] rounded w-6 h-6 flex items-center justify-center text-xs text-[var(--text)] z-10 transition-colors"
                    >
                      ✎
                    </button>
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

      {/* Edit Modal Portal */}
      {editingItem && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-[var(--void)]/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm text-left">
          <div className="bg-[var(--panel)] border border-[var(--panel-2)] p-6 rounded-xl w-full max-w-sm shadow-[0_0_20px_rgba(5,217,232,0.15)] pointer-events-auto">
            <h2 className="text-xl font-['Audiowide'] text-[var(--cyan)] mb-4 text-center">Edit Item</h2>
            
            <div className="w-full h-48 mb-4 rounded overflow-hidden border border-[var(--violet)] bg-black">
              <img src={getImageUrl(editingItem.image_path)} alt="Preview" className="w-full h-full object-cover" />
            </div>

            <div className="mb-4">
              <label className="block text-xs text-[var(--text-dim)] mb-1 tracking-wider uppercase">Category</label>
              <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full bg-[var(--void)] border border-[var(--panel-2)] text-[var(--text)] p-3 rounded focus:outline-none focus:border-[var(--pink)] transition appearance-none">
                <option value="hat">Hat</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="shoes">Shoes</option>
                <option value="accessory">Accessory</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-xs text-[var(--text-dim)] mb-1 tracking-wider uppercase">Description</label>
              <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="w-full bg-[var(--void)] border border-[var(--panel-2)] text-[var(--text)] p-3 rounded focus:outline-none focus:border-[var(--pink)] transition" />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditingItem(null)} className="flex-1 bg-transparent border border-[var(--text-dim)] text-[var(--text-dim)] p-3 rounded hover:bg-[var(--panel-2)] transition" disabled={isProcessing}>
                  Cancel
                </button>
                <button type="button" onClick={handleUpdate} className="flex-1 cta border-none m-0" disabled={isProcessing}>
                  {isProcessing ? "Saving..." : "Save"}
                </button>
              </div>
              <button type="button" onClick={handleDelete} className="w-full bg-transparent border border-red-900/50 text-red-500 p-3 rounded hover:bg-red-900/20 transition mt-2" disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Delete Item"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}