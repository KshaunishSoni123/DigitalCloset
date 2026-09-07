"use client";

import { deleteClothingItem } from "@/app/backend/closet";
import {createClient} from "@/utils/supabase/client";
import { useState } from "react";

export default function ClosetGrid({ clothes }: { clothes: any[] }) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const supabase = createClient();

    const handleDelete = async (id: string, imagePath: string) => {
        setDeletingId(id);
        await deleteClothingItem(id, imagePath);
        setDeletingId(null);
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {clothes.map((item) => {
          // Retrieve the public URL for rendering
          const { data } = supabase.storage
            .from('closet_images')
            .getPublicUrl(item.image_path);
  
          return (
            <div key={item.id} className="relative group border rounded p-2">
              <img 
                src={data.publicUrl} 
                alt={item.category} 
                className="w-full h-48 object-cover rounded" 
              />
              <button 
                onClick={() => handleDelete(item.id, item.image_path)}
                disabled={deletingId === item.id}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
              >
                Delete
              </button>
              <p className="mt-2 text-sm font-semibold text-center">{item.category}</p>
            </div>
          );
        })}
      </div>
      );
}