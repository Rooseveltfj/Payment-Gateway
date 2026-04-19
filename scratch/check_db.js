const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    console.log("Checking AffiliateOffer table...");
    const count = await prisma.affiliateOffer.count();
    console.log("AffiliateOffer count:", count);
  } catch (err) {
    console.error("DATABASE ERROR:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
