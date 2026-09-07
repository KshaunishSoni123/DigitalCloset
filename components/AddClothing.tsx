"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { addClothingItem } from "@/app/backend/closet"; 

export default function AddClothing() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState("top"); 
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = createClient();

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setErrorMsg("");
  };

  const handleSave = async () => {
    console.log("1. Save clicked");
    if (!file) return;
    setIsUploading(true);
    setErrorMsg("");
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("You must be logged in to upload.");

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const imagePath = `${userId}/${fileName}`;

      console.log("2. Uploading image to storage...");
      const { error: uploadError } = await supabase.storage
        .from('closet_images')
        .upload(imagePath, file);

      if (uploadError) throw new Error(`Storage Error: ${uploadError.message}`);

      console.log("3. Calling backend action...");
      await addClothingItem({ category, description, image_path: imagePath });

      console.log("4. Success!");
      resetForm();
    } catch (error: any) {
      console.error("Upload failed:", error);
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

  return (
    <>
      {errorMsg && !file && <p className="text-red-500 mb-2 font-semibold text-center text-sm">{errorMsg}</p>}
      
      {/* The trigger button stays exactly where it is in the header */}
      <label className="cta inline-block cursor-pointer">
        add clothes
        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
      </label>

      {/* The modal is teleported to the root body to escape CSS constraints */}
      {file && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 bg-[var(--void)]/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm text-left">
          <div className="bg-[var(--panel)] border border-[var(--panel-2)] p-6 rounded-xl w-full max-w-sm shadow-[0_0_20px_rgba(5,217,232,0.15)] pointer-events-auto">
            <h2 className="text-xl font-['Audiowide'] text-[var(--cyan)] mb-4 text-center">New Item</h2>
            
            {preview && (
              <div className="w-full h-48 mb-4 rounded overflow-hidden border border-[var(--violet)] bg-black">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            {errorMsg && <p className="text-[#ff5f7e] text-sm mb-3 text-center">{errorMsg}</p>}

            <div className="mb-4">
              <label className="block text-xs text-[var(--text-dim)] mb-1 tracking-wider uppercase">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[var(--void)] border border-[var(--panel-2)] text-[var(--text)] p-3 rounded focus:outline-none focus:border-[var(--pink)] transition appearance-none">
                <option value="hat">Hat</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="shoes">Shoes</option>
                <option value="accessory">Accessory</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-xs text-[var(--text-dim)] mb-1 tracking-wider uppercase">Description (Optional)</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Acid-wash denim jacket" className="w-full bg-[var(--void)] border border-[var(--panel-2)] text-[var(--text)] p-3 rounded focus:outline-none focus:border-[var(--pink)] transition" />
            </div>

            <div className="flex gap-3">
              {/* Added type="button" to prevent default form submission behaviors */}
              <button type="button" onClick={resetForm} className="flex-1 bg-transparent border border-[var(--text-dim)] text-[var(--text-dim)] p-3 rounded hover:bg-[var(--panel-2)] transition" disabled={isUploading}>
                Cancel
              </button>
              <button type="button" onClick={handleSave} className="flex-1 cta border-none m-0" disabled={isUploading}>
                {isUploading ? "Saving..." : "Save to Closet"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}