import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { batchesTable, coopAllocationsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET a single batch by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const batchId = parseInt(id);

    if (isNaN(batchId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const batch = await db.query.batchesTable.findFirst({
      where: eq(batchesTable.id, batchId),
      with: {
        coopAllocations: true,
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    return NextResponse.json(batch, { status: 200 });
  } catch (error) {
    console.error("Error fetching batch:", error);
    return NextResponse.json(
      { error: "Failed to fetch batch" },
      { status: 500 }
    );
  }
}

// PUT update a batch
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const batchId = parseInt(id);

    if (isNaN(batchId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      name,
      supplier,
      breed,
      arrival_date,
      intake_age_days,
      initial_quantity,
      current_count,
      cost_per_bird,
      transport_cost,
      equipment_cost,
      total_initial_cost,
      amount_paid_upfront,
      balance_due,
      payment_status,
      currency,
      is_active,
      coop_allocations,
    } = body;

    const updateData: any = { updatedAt: new Date() };

    if (name) updateData.name = name;
    if (supplier) updateData.supplier = supplier;
    if (breed) updateData.breed = breed;
    if (arrival_date) updateData.arrivalDate = new Date(arrival_date);
    if (intake_age_days !== undefined) updateData.intakeAgeDays = intake_age_days;
    if (initial_quantity !== undefined) updateData.initialQuantity = initial_quantity;
    if (current_count !== undefined) updateData.currentCount = current_count;
    if (cost_per_bird !== undefined) updateData.costPerBird = cost_per_bird;
    if (transport_cost !== undefined) updateData.transportCost = transport_cost;
    if (equipment_cost !== undefined) updateData.equipmentCost = equipment_cost;
    if (total_initial_cost !== undefined) updateData.totalInitialCost = total_initial_cost;
    if (amount_paid_upfront !== undefined) updateData.amountPaidUpfront = amount_paid_upfront;
    if (balance_due !== undefined) updateData.balanceDue = balance_due;
    if (payment_status) updateData.paymentStatus = payment_status;
    if (currency) updateData.currency = currency;
    if (is_active !== undefined) updateData.isActive = is_active;

    const [updatedBatch] = await db
      .update(batchesTable)
      .set(updateData)
      .where(eq(batchesTable.id, batchId))
      .returning();

    if (!updatedBatch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Update coop allocations if provided
    if (coop_allocations) {
      // Delete existing allocations
      await db
        .delete(coopAllocationsTable)
        .where(eq(coopAllocationsTable.batchId, batchId));

      // Insert new allocations
      const allocationsToInsert = coop_allocations
        .filter(
          (alloc: any) => alloc.coop_id && alloc.allocated_quantity > 0
        )
        .map((alloc: any) => ({
          batchId: batchId,
          coopId: alloc.coop_id,
          allocatedQuantity: alloc.allocated_quantity,
          placementDate: new Date(alloc.placement_date || updatedBatch.arrivalDate),
          notes: alloc.notes || null,
          initialMortality: alloc.initial_mortality || 0,
        }));

      if (allocationsToInsert.length > 0) {
        await db.insert(coopAllocationsTable).values(allocationsToInsert);
      }
    }

    // Fetch updated batch with allocations
    const batchWithAllocations = await db.query.batchesTable.findFirst({
      where: eq(batchesTable.id, batchId),
      with: {
        coopAllocations: true,
      },
    });

    return NextResponse.json(batchWithAllocations, { status: 200 });
  } catch (error) {
    console.error("Error updating batch:", error);
    return NextResponse.json(
      { error: "Failed to update batch" },
      { status: 500 }
    );
  }
}

// DELETE a batch
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const batchId = parseInt(id);

    if (isNaN(batchId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const [deletedBatch] = await db
      .delete(batchesTable)
      .where(eq(batchesTable.id, batchId))
      .returning();

    if (!deletedBatch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Batch deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting batch:", error);
    return NextResponse.json(
      { error: "Failed to delete batch" },
      { status: 500 }
    );
  }
}
