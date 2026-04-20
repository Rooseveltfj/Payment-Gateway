// @ts-nocheck
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'No session' });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { _count: { select: { orders: true } } }
  });

  return NextResponse.json({ session, dbUser: user });
}
