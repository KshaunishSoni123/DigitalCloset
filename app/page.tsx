export const instant = false; // Opt out of prerendering: this page reads cookies via Supabase auth

import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getClothes } from "@/app/backend/closet";
import AddClothing from "@/components/AddClothing";
import ClosetUI from "@/components/ClosetUI";

async function ClosetContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");
  const clothes = await getClothes();

  return <ClosetUI clothes={clothes} />;
}

export default function ClosetPage() {
  return (
    <main>
      {/* Synthwave Header */}
      <div className="relative overflow-hidden text-center pt-9 pb-6" style={{ background: 'linear-gradient(180deg, #2b0a45 0%, #6b1e6e 55%, #ff5f7e 90%, #ffb347 130%)' }}>
        <div className="grid-floor"></div>
        <div className="relative z-10">
          <h1 className="text-2xl m-0 tracking-wide font-['Audiowide']" style={{ textShadow: '0 0 8px var(--cyan), 0 0 18px var(--pink)' }}>
            CLOSETWAVE
          </h1>
          <p className="text-[#b8a8d9] text-sm mt-2 mb-5">What should we wear today?</p>
          
          {/* Wraps your existing AddClothing button to match the theme */}
          <div className="inline-block relative z-20">
             <AddClothing /> 
          </div>
        </div>
      </div>

      <Suspense fallback={<p className="p-4 text-center animate-pulse text-[var(--cyan)]">Loading the grid...</p>}>
        <ClosetContent />
      </Suspense>
    </main>
  );
}