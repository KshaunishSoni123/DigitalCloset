export const instant = false; // Opt out of prerendering: this page reads cookies via Supabase auth

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClothes } from "@/app/backend/closet";
import AddClothing from "@/components/AddClothing";
import ClosetGrid from "@/components/ClosetGrid"; // Adjust path if needed

export default async function ClosetPage() {
  const supabase = await createClient();
  
  // Checking the user securely reads cookies, automatically making this route dynamic
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const clothes = await getClothes();

  return (
    <main className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold px-4 mb-4">My Digital Closet</h1>
      <AddClothing />
      <ClosetGrid clothes={clothes} />
    </main>
  );
}