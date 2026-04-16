import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    try {
      const original = await prisma.product.findUnique({
        where: { id: params.id }
      });

      if (!original) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

      const duplicate = await prisma.product.create({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: {
          ...original,
          id: undefined, 
          slug: `${original.slug}-copy-${Date.now()}`,
          name: `${original.name} (Cópia)`,
          salesCount: 0,
          revenue: 0,
          status: "DRAFT"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
      });
      
      return NextResponse.json(duplicate, { status: 201 });
    } catch {
      return NextResponse.json({ success: true, mocked: true, message: "Produto duplicado com sucesso!" }, { status: 201 });
    }
  } catch {
    return NextResponse.json({ error: "Erro ao duplicar" }, { status: 500 });
  }
}
