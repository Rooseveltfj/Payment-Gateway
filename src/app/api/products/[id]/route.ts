import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import z from "zod";

const UpdateProductSchema = z.object({
  name: z.string().min(2).optional(),
  price: z.number().positive().optional(),
  description: z.string().optional().nullable(),
  slug: z.string().min(2).optional(),
  imageUrl: z.string().url().optional().nullable(),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("PRODUCT_GET_ERROR:", error);
    return NextResponse.json({ error: "Erro ao carregar produto" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = UpdateProductSchema.parse(body);

    const product = await prisma.product.update({
      where: { 
        id: params.id,
        userId: session.user.id
      },
      data
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("PRODUCT_UPDATE_ERROR:", error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}
