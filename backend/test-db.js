// Quick test: Prisma + mariadb adapter
process.env.DATABASE_URL = "mysql://u538852360_discuser:Redowan173123@srv1983.hstgr.io:3306/u538852360_discdb";

const { prisma } = require("./dist/utils/db.js");

async function test() {
  try {
    const result = await prisma.$queryRawUnsafe("SELECT 1 AS ok");
    console.log("✅ Prisma + mariadb adapter works!", JSON.stringify(result));
    
    // Also test a real table
    const users = await prisma.user.count();
    console.log("✅ Users table count:", users);
    
    const deals = await prisma.deal.count();
    console.log("✅ Deals table count:", deals);
    
    const categories = await prisma.category.count();
    console.log("✅ Categories table count:", categories);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

test();
