import { prisma } from "../src/lib/prisma";

async function checkDb() {
  try {
    const userCount = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    const pendingKycCount = await prisma.user.count({ where: { kycStatus: "PENDING" } });
    
    console.log("Total Users:", userCount);
    console.log("Total Admins:", adminCount);
    console.log("Pending KYC:", pendingKycCount);
    
    const sampleUsers = await prisma.user.findMany({ take: 5 });
    console.log("Sample Users:", JSON.stringify(sampleUsers, null, 2));
  } catch (error) {
    console.error("Database check failed:", error);
  }
}

checkDb();
