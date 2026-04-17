import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Uses process.env fallback so it doesn't crash if omitted for UI dev
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "mock-key";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });

// Mock response if valid env variables aren't provided
if (supabaseUrl === "https://mock.supabase.co" || supabaseKey === "mock-key") {
   // Artificial delay for better UX feel during mock
   await new Promise(r => setTimeout(r, 800));
   return NextResponse.json({ url: "https://via.placeholder.com/600x400?text=PulsePay+Mock+Upload" });
}

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, file, { cacheControl: "3600", upsert: true });

    if (uploadError) {
      console.error("SUPABASE_UPLOAD_ERROR:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from("products").getPublicUrl(fileName);

    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json({ error: (error as any).message || "Erro no upload" }, { status: 500 });
  }
}
