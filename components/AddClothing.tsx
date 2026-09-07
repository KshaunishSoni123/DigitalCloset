"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { addClothingItem } from "@/app/backend/closet";
import { ClothingInsert } from "@/app/backend/closet";

export default function AddClothing() {
    // Store the raw file and a local preview URL
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    
    // Form state
    const [category, setCategory] = useState("top"); 
    const [description, setDescription] = useState("");
    
    // Loading & Error state
    const [isUploading, setIsUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const supabase = createClient();

    const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFile(file);
        setPreview(URL.createObjectURL(file));
        setErrorMsg("");

        setIsUploading(true);
    };

    const handleSave = async () => {
        if (!file) return;

        setIsUploading(true);
        setErrorMsg("");

        try {
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData.user?.id;
            if (!userId) throw new Error("User not authenticated");

            const fileExt = file.name.split('.').pop();
            const fileName  = `${crypto.randomUUID()}.${fileExt}`;
            const imagePath = `${userId}/${fileName}`;

            //upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('closet_images')
                .upload(imagePath, file);

            if (uploadError) throw new Error(uploadError.message);

            // Call Server Action
            await addClothingItem({
                category,
                image_path: imagePath,
                description
            });

            // Reset form
            resetForm();
        } catch (error: any) {
            console.error(error);
            setErrorMsg(error.message || "An unknown error occurred");
          } finally {
            setIsUploading(false);
          }
    };

    const resetForm = () => {
        setFile(null);
        setPreview(null);
        setCategory("top");
        setDescription("");
    };

 // If no file is selected, just show the upload button
 if (!file) {
    return (
      <>
        {errorMsg && <p className="text-red-500 mb-2 font-semibold text-center text-sm">{errorMsg}</p>}
        <label className="cta inline-block cursor-pointer">
          add clothes
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            onChange={handleCapture} 
          />
        </label>
      </>
    );
  }

  // If a file IS selected, show the details form overlay
  return (
    <div className="fixed inset-0 bg-[var(--void)]/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm text-left">
      <div className="bg-[var(--panel)] border border-[var(--panel-2)] p-6 rounded-xl w-full max-w-sm shadow-[0_0_20px_rgba(5,217,232,0.15)]">
        <h2 className="text-xl font-['Audiowide'] text-[var(--cyan)] mb-4 text-center">New Item</h2>
        
        {/* Image Preview */}
        {preview && (
          <div className="w-full h-48 mb-4 rounded overflow-hidden border border-[var(--violet)] bg-black">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}

        {errorMsg && <p className="text-[#ff5f7e] text-sm mb-3 text-center">{errorMsg}</p>}

        {/* Category Dropdown */}
        <div className="mb-4">
          <label className="block text-xs text-[var(--text-dim)] mb-1 tracking-wider uppercase">Category</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[var(--void)] border border-[var(--panel-2)] text-[var(--text)] p-3 rounded focus:outline-none focus:border-[var(--pink)] transition appearance-none"
          >
            {/* The values must match the keys in ClosetUI Categories exactly */}
            <option value="hat">Hat</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="shoes">Shoes</option>
            <option value="accessory">Accessory</option>
          </select>
        </div>

        {/* Optional Description */}
        <div className="mb-6">
          <label className="block text-xs text-[var(--text-dim)] mb-1 tracking-wider uppercase">Description (Optional)</label>
          <input 
            type="text" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Acid-wash denim jacket"
            className="w-full bg-[var(--void)] border border-[var(--panel-2)] text-[var(--text)] p-3 rounded focus:outline-none focus:border-[var(--pink)] transition"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={resetForm}
            className="flex-1 bg-transparent border border-[var(--text-dim)] text-[var(--text-dim)] p-3 rounded hover:bg-[var(--panel-2)] transition"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 cta border-none m-0"
            disabled={isUploading}
          >
            {isUploading ? "Saving..." : "Save to Closet"}
          </button>
        </div>
      </div>
    </div>
  );
}