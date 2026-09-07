"user client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { addClothingItem } from "@/app/backend/closet";
import { ClothingInsert } from "@/app/types";
import { userAgent } from "next/server";

export default function AddClothing() {
    const [isUploading, setIsUploading] = useState(false);
    const supabase = createClient();

    const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            // 1. Generate unique path for the image
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData.user?.id;
            const fileExt = file.name.split('.').pop();
            const fileName  = '${crypto.randomUUID()}.${fileExt}';
            const imagePath = '${userId}/${fileName}';

            // 2. Uplload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('closet_images')
                .upload(imagePath, file);

            if (uploadError) throw new Error(uploadError.message);
            
            // 3. Create a new clothing item in the database
            const newClothingItem: ClothingInsert = {
                name: 'New Item',
                category: 'Uncategorized',
                image_path: imagePath,
                user_id: userId || '',
            };

            await addClothingItem(newClothingItem);

        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setIsUploading(false);
        }

    };

    return (
        <div className="p-4">
        <label className="block p-4 text-center bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition">
          {isUploading ? "Uploading..." : "Take Picture"}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" // Forces the rear camera to open on mobile
            className="hidden" 
            onChange={handleCapture} 
            disabled={isUploading}
          />
        </label>
      </div>
    );
}