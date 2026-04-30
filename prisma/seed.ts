import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data (safe for fresh db)
  await prisma.stock.deleteMany();
  await prisma.sales.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.material.deleteMany();

  // ==========================================
  // SEED MATERIALS
  // ==========================================
  console.log("Creating materials...");
  await prisma.material.create({ data: { name: "Lycra" } });
  await prisma.material.create({ data: { name: "Rubber" } });
  await prisma.material.create({ data: { name: "Cotton" } });
  await prisma.material.create({ data: { name: "Polyester" } });
  await prisma.material.create({ data: { name: "Nylon" } });

  console.log("✅ Created materials");

  // Get created materials
  const lycra = await prisma.material.findUnique({ where: { name: "Lycra" } });
  const rubber = await prisma.material.findUnique({ where: { name: "Rubber" } });
  const cotton = await prisma.material.findUnique({ where: { name: "Cotton" } });

  if (!lycra || !rubber || !cotton) {
    throw new Error("Failed to find created materials");
  }

  // ==========================================
  // SEED PURCHASE ENTRIES
  // ==========================================
  console.log("Creating purchase entries...");
  await prisma.purchase.create({
    data: {
      date: new Date("2026-04-25"),
      invoice_no: "INV-001",
      supplier: "Premier Materials",
      materialId: lycra.id,
      quantity_kg: 100,
      quantity_box: 10,
      remarks: "Good quality shipment",
    },
  });

  await prisma.purchase.create({
    data: {
      date: new Date("2026-04-26"),
      invoice_no: "INV-002",
      supplier: "Rubber Supplies Inc",
      materialId: rubber.id,
      quantity_kg: 75,
      quantity_box: 15,
      remarks: null,
    },
  });

  console.log("✅ Created purchase entries");

  // ==========================================
  // SEED SALES ENTRIES
  // ==========================================
  console.log("Creating sales entries...");
  await prisma.sales.create({
    data: {
      date: new Date(),
      customer_name: "Tapes & More",
      size_mm: 12,
      quantity: 10,
      rate: 5.5,
      amount: 55,
      remarks: "Regular customer",
    },
  });

  console.log("✅ Created sales entries");

  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
