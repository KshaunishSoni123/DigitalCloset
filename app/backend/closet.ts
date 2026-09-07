"use server";

import { createClient } from '@/lib/supabase/server'; // Provided by the Supabase starter
import { revalidatePath } from 'next/cache';
import { logger } from '@/utils/logger';

export type ClothingInsert = {
    category: string;
    image_path: string;
    description?: string;
    tags?: string[];
};

export type ClothingUpdate = Partial<ClothingInsert>;

//Read Operation
export async function getClothes() {
    const supabase = await createClient();
    const { data: clothes, error } = await supabase
        .from('clothes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return clothes;
}

//Create Operation
export async function addClothingItem(data: ClothingInsert) {
    const supabase = await createClient();
    const startTime = Date.now();

    //Supabase SSR client automatically grabs user from session cookie
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
        logger.warn("Unauthorized upload attempt", { action: "addClothingItem", error: userError?.message });
        throw new Error("Unauthorized");
      }


    const userId = userData.user.id;
    logger.info("Attempting to insert clothing item", { action: "addClothingItem", userId, metadata: { category: data.category } });
    
    const { data: newCloth, error } = await supabase
        .from('clothes')
        .insert([{
            ...data, 
            user_id: userData.user.id 
        }])
        .select()
        .single();

    if (error) throw new Error(error.message);

    revalidatePath('/closet');

    logger.info("Clothing item inserted successfully", { 
        action: "addClothingItem", 
        userId, 
        metadata: { id: newCloth.id, latencyMs: Date.now() - startTime } 
      });

    return newCloth;
}

export async function updateClothingItem(id: number, category: string, description: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from('clothes')
      .update({ category, description })
      .eq('id', id);
  
    if (error) throw new Error(error.message);
    revalidatePath('/');
  }

//Update Operation
export async function UpdateClothingItem(id: number, category: string, description: string) {
    const supabase = await createClient();
    const startTime = Date.now();

    logger.info("Attempting to Update clothing item", { action: "updateClothingItem",  metadata: { category: category } });
    
    const { error } = await supabase
    .from('clothes')
    .update({ category, description })
    .eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/closet');

    logger.info("Clothing item Updated successfully", { 
        action: "updateClothingItem", 
        metadata: { id: id, latencyMs: Date.now() - startTime } 
      });

    return id;
}

//Delete Operation

export async function deleteClothingItem(id: string, imagePath: string) {
    const supabase = await createClient();
    const startTime = Date.now();
    
    //1. Delete image from bucket
    const {error: storageError} = await supabase
        .storage
        .from('closet_images')
        .remove([imagePath]);
        
    if (storageError) throw new Error(storageError.message);

    logger.info("Attempting to delete clothing item", { action: "deleteClothingItem", metadata: { id, imagePath } });
    

    //2. Delete record from database
    const { data: deletedCloth, error } = await supabase
        .from('clothes')
        .delete()
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);

    logger.info("Clothing item deleted successfully", { 
        action: "deleteClothingItem", 
        metadata: { id: id, latencyMs: Date.now() - startTime } 
      });

    revalidatePath('/closet');
    return {success: true}
}