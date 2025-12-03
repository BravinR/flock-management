import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { batchesTable, coopAllocationsTable } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

// GET all batches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");

    let query = db.select().from(batchesTable);

    // Filter by active status if provided
    if (isActive !== null) {
      const activeStatus = isActive === "true";
      query = query.where(eq(batchesTable.isActive, activeStatus)) as any;
    }

    const batches = await query.orderBy(desc(batchesTable.arrivalDate));

    return NextResponse.json(batches, { status: 200 });
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json(
      { error: "Failed to fetch batches" },
      { status: 500 }
    );
  }
}

// POST create a new batch
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      batch_name,
      supplier,
      breed,
      arrival_date,
      intake_age_days,
      initial_quantity,
      currency,
      cost_per_bird,
      transport_cost,
      equipment_cost,
      amount_paid_upfront,
      total_acquisition_cost,
      balance_due,
      payment_status,
      coop_allocations,
    } = body;

    // Validate required fields
    if (
      !batch_name ||
      !supplier ||
      !breed ||
      !arrival_date ||
      intake_age_days === undefined ||
      !initial_quantity
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate batch_id
    const batchId = `batch_${breed.toLowerCase()}_${new Date(arrival_date)
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "")}`;

    // Create the batch
    const [newBatch] = await db
      .insert(batchesTable)
      .values({
        batchId,
        name: batch_name,
        supplier,
        breed,
        arrivalDate: new Date(arrival_date),
        intakeAgeDays: intake_age_days,
        initialQuantity: initial_quantity,
        currentCount: initial_quantity, // Initially same as initial quantity
        costPerBird: cost_per_bird || 0,
        transportCost: transport_cost || 0,
        equipmentCost: equipment_cost || 0,
        totalInitialCost: total_acquisition_cost || 0,
        amountPaidUpfront: amount_paid_upfront || 0,
        balanceDue: balance_due || 0,
        paymentStatus: payment_status || "pending",
        currency: currency || "KES",
        isActive: true,
      })
      .returning();

    // Create coop allocations if provided
    if (coop_allocations && coop_allocations.length > 0) {
      const allocationsToInsert = coop_allocations
        .filter(
          (alloc: any) => alloc.coop_id && alloc.allocated_quantity > 0
        )
        .map((alloc: any) => ({
          batchId: newBatch.id,
          coopId: alloc.coop_id,
          allocatedQuantity: alloc.allocated_quantity,
          placementDate: new Date(alloc.placement_date || arrival_date),
          notes: alloc.notes || null,
          initialMortality: alloc.initial_mortality || 0,
        }));

      if (allocationsToInsert.length > 0) {
        await db.insert(coopAllocationsTable).values(allocationsToInsert);
      }
    }

    // Fetch the batch with allocations
    const batchWithAllocations = await db.query.batchesTable.findFirst({
      where: eq(batchesTable.id, newBatch.id),
      with: {
        coopAllocations: true,
      },
    });

    return NextResponse.json(batchWithAllocations, { status: 201 });
  } catch (error) {
    console.error("Error creating batch:", error);
    return NextResponse.json(
      { error: "Failed to create batch", details: (error as Error).message },
      { status: 500 }
    );
  }
}
