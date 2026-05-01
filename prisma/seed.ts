import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // ==========================================
  // SEED MATERIALS
  // ==========================================
  console.log("Creating materials...");
  
  const materials = [
    { name: "Lycra" },
    { name: "Rubber" },
    { name: "Cotton" },
    { name: "Polyester" },
    { name: "Nylon" }
  ];

  for (const material of materials) {
    try {
      await prisma.material.upsert({
        where: { name: material.name },
        update: {},
        create: material,
      });
    } catch (error) {
      console.log(`Material ${material.name} already exists or error:`, error);
    }
  }

  console.log("✅ Created/verified materials");

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
  
  try {
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
  } catch (error) {
    console.log("Purchase entry 1 already exists or error:", error);
  }

  try {
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
  } catch (error) {
    console.log("Purchase entry 2 already exists or error:", error);
  }

  console.log("✅ Created/verified purchase entries");

  // ==========================================
  // SEED SALES ENTRIES
  // ==========================================
  console.log("Creating sales entries...");
  
  try {
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
  } catch (error) {
    console.log("Sales entry already exists or error:", error);
  }

  console.log("✅ Created/verified sales entries");

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
