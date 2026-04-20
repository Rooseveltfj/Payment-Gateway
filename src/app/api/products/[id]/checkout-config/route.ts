import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { checkoutConfig } = await req.json();

    const product = await prisma.product.update({
      where: { id: params.id, userId: session.user.id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { checkoutConfig: checkoutConfig as any },
    });

    // Invalidate the public checkout page cache immediately
    revalidatePath(`/c/${product.slug}`, 'page');
    revalidatePath(`/c/${product.slug}`);
    revalidatePath(`/api/products/${params.id}/checkout-config`);

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("CHECKOUT_CONFIG_UPDATE_ERROR:", error);
    return NextResponse.json({ error: "Erro ao salvar configuração no banco" }, { status: 500 });
  }
}
