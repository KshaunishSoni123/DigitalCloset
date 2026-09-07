export const dynamic = 'force-dynamic'; // Tells Next.js to skip pre-rendering

import { getClothes } from "@/app/backend/closet";
import AddClothing from "@/components/AddClothing";
import ClosetGrid from "@/components/ClosetGrid";

export default async function ClosetPage() {
  const clothes = await getClothes();

  return (
    <main className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold px-4 mb-4">My Digital Closet</h1>
      <AddClothing />
      <ClosetGrid clothes={clothes} />
    </main>
  );
}