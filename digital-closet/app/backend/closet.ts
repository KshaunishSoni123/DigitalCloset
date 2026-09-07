"use server";

import { createClient } from '@/utils/supabase/server'; // Provided by the Supabase starter
import { revalidatePath } from 'next/cache';

export type ClothingInsert = {
    category: string;
    image_path: string;
    description?: string;
    tags?: string[];
};

export type ClothingUpdate = Partial<ClothingInsert>;

//Read Operation
export async function getClothes() {
    const supabase = createClient();
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
    const supabase = createClient();

    //Supabase SSR client automatically grabs user from session cookie
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.data.user) {
        throw new Error(userError.message)
    };

    const { data: newCloth, error } = await supabase
        .from('clothes')
        .insert([{
            ...data, 
            user_id: userData.data.user.id 
        }])
        .select()
        .single();

    if (error) throw new Error(error.message);

    revalidatePath('/closet');

    return newCloth;
}

//Update Operation
export async function UpdateClothingItem(id: string, updates: ClothingUpdate) {
    const supabase = createClient();

    const { data: updatedCloth, error } = await supabase
        .from('clothes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);

    revalidatePath('/closet');

    return updatedCloth;
}

//Delete Operation

export async function deleteClothingItem(id: string, imagePath: string) {
    const supabase = createClient();

    //1. Delete image from bucket
    const {error: storageError} = await supabase
        .storage
        .from('closet_images')
        .remove([imagePath]);
        
    if (storageError) throw new Error(storageError.message);

    //2. Delete record from database
    const { data: deletedCloth, dbError } = await supabase
        .from('clothes')
        .delete()
        .eq('id', id)
        .select()
        .single();

    if (dbError) throw new Error(dbError.message);

    revalidatePath('/closet');
    return {success: true}
}