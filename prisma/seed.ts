import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data (safe for fresh db)
  await prisma.inventoryLedger.deleteMany();
  await prisma.production.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.material.deleteMany();

  // ==========================================
  // SEED MATERIALS
  // ==========================================
  const materials = await prisma.material.createMany({
    data: [
      { name: "Lycra" },
      { name: "Rubber" },
      { name: "Cotton" },
      { name: "Polyester" },
      { name: "Nylon" },
    ],
  });

  console.log(`✅ Created ${materials.count} materials`);

  // Get created materials
  const lycra = await prisma.material.findUnique({ where: { name: "Lycra" } });
  const rubber = await prisma.material.findUnique({
    where: { name: "Rubber" },
  });
  const cotton = await prisma.material.findUnique({
    where: { name: "Cotton" },
  });

  // ==========================================
  // SEED PURCHASE ENTRIES
  // ==========================================
  const purchaseData = await prisma.purchase.createMany({
    data: [
      {
        date: new Date("2026-04-25"),
        invoice_no: "INV-001",
        supplier: "Premier Materials",
        materialId: lycra!.id,
        quantity_kg: 100,
        quantity_box: 10,
        packing_ok: true,
        winding_uneven: false,
        colour_shade_ok: true,
        dnk_og_ok: true,
        stain: false,
        strength_ok: true,
        stretchability_ok: true,
        remarks: "Good quality shipment",
      },
      {
        date: new Date("2026-04-26"),
        invoice_no: "INV-002",
        supplier: "Rubber Supplies Inc",
        materialId: rubber!.id,
        quantity_kg: 75,
        quantity_box: 15,
        packing_ok: true,
        winding_uneven: false,
        colour_shade_ok: true,
        dnk_og_ok: true,
        stain: false,
        strength_ok: true,
        stretchability_ok: true,
        remarks: null,
      },
      {
        date: new Date("2026-04-27"),
        invoice_no: "INV-003",
        supplier: "Cotton World",
        materialId: cotton!.id,
        quantity_kg: 50,
        quantity_box: 5,
        packing_ok: true,
        winding_uneven: true,
        colour_shade_ok: false,
        dnk_og_ok: true,
        stain: false,
        strength_ok: true,
        stretchability_ok: false,
        remarks: "Minor QC issues noted",
      },
    ],
  });

  console.log(`✅ Created ${purchaseData.count} purchase entries`);

  // ==========================================
  // SEED PRODUCTION ENTRIES
  // ==========================================
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const productionData = await prisma.production.createMany({
    data: [
      {
        date: today,
        operator_name: "Raj Kumar",
        materialId: lycra!.id,
        size_mm: 12,
        tapes: 50,
        meters_per_tape: 100,
        needle_break: 2,
        total_production: 5000,
        remark: "Production completed on time",
      },
      {
        date: today,
        operator_name: "Priya Sharma",
        materialId: rubber!.id,
        size_mm: 24,
        tapes: 40,
        meters_per_tape: 150,
        needle_break: 1,
        total_production: 6000,
        remark: null,
      },
      {
        date: today,
        operator_name: "Amit Singh",
        materialId: cotton!.id,
        size_mm: 6,
        tapes: 80,
        meters_per_tape: 75,
        needle_break: 0,
        total_production: 6000,
        remark: "Excellent production day",
      },
    ],
  });

  console.log(`✅ Created ${productionData.count} production entries`);

  // ==========================================
  // SEED INVENTORY LEDGER
  // ==========================================
  const inventoryData = await prisma.inventoryLedger.createMany({
    data: [
      {
        date: today,
        materialId: lycra!.id,
        size_mm: 12,
        opening_stock: 10000,
        purchase: 5000,
        production: 5000,
        delivery: 2000,
        balance: 18000, // 10000 + 5000 + 5000 - 2000
      },
      {
        date: today,
        materialId: rubber!.id,
        size_mm: 24,
        opening_stock: 8000,
        purchase: 3000,
        production: 6000,
        delivery: 1500,
        balance: 15500, // 8000 + 3000 + 6000 - 1500
      },
      {
        date: today,
        materialId: cotton!.id,
        size_mm: 6,
        opening_stock: 5000,
        purchase: 2000,
        production: 6000,
        delivery: 1000,
        balance: 12000, // 5000 + 2000 + 6000 - 1000
      },
    ],
  });

  console.log(`✅ Created ${inventoryData.count} inventory ledger entries`);

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
