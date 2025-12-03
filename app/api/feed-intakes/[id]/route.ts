import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { feedIntakesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET a single feed intake by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const feedIntakeId = parseInt(id);

    if (isNaN(feedIntakeId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const [feedIntake] = await db
      .select()
      .from(feedIntakesTable)
      .where(eq(feedIntakesTable.id, feedIntakeId));

    if (!feedIntake) {
      return NextResponse.json(
        { error: "Feed intake not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(feedIntake, { status: 200 });
  } catch (error) {
    console.error("Error fetching feed intake:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed intake" },
      { status: 500 }
    );
  }
}

// PUT update a feed intake
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const feedIntakeId = parseInt(id);

    if (isNaN(feedIntakeId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      deliveryDate,
      feedType,
      customFeedName,
      supplierId,
      supplierName,
      inputMode,
      bagsReceived,
      kgReceived,
      costPerBag,
      costPerKg,
      totalCost,
      currency,
      batchNumber,
      invoiceNumber,
      notes,
      receivedBy,
    } = body;

    const updateData: any = { updatedAt: new Date() };

    if (deliveryDate) updateData.deliveryDate = new Date(deliveryDate);
    if (feedType) updateData.feedType = feedType;
    if (customFeedName !== undefined) updateData.customFeedName = customFeedName;
    if (supplierId !== undefined) updateData.supplierId = supplierId;
    if (supplierName !== undefined) updateData.supplierName = supplierName;
    if (inputMode) updateData.inputMode = inputMode;
    if (bagsReceived !== undefined) updateData.bagsReceived = bagsReceived;
    if (kgReceived !== undefined) updateData.kgReceived = kgReceived;
    if (costPerBag !== undefined) updateData.costPerBag = costPerBag;
    if (costPerKg !== undefined) updateData.costPerKg = costPerKg;
    if (totalCost) updateData.totalCost = totalCost;
    if (currency) updateData.currency = currency;
    if (batchNumber !== undefined) updateData.batchNumber = batchNumber;
    if (invoiceNumber !== undefined) updateData.invoiceNumber = invoiceNumber;
    if (notes !== undefined) updateData.notes = notes;
    if (receivedBy) updateData.receivedBy = receivedBy;

    const [updatedFeedIntake] = await db
      .update(feedIntakesTable)
      .set(updateData)
      .where(eq(feedIntakesTable.id, feedIntakeId))
      .returning();

    if (!updatedFeedIntake) {
      return NextResponse.json(
        { error: "Feed intake not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedFeedIntake, { status: 200 });
  } catch (error) {
    console.error("Error updating feed intake:", error);
    return NextResponse.json(
      { error: "Failed to update feed intake" },
      { status: 500 }
    );
  }
}

// DELETE a feed intake
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const feedIntakeId = parseInt(id);

    if (isNaN(feedIntakeId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const [deletedFeedIntake] = await db
      .delete(feedIntakesTable)
      .where(eq(feedIntakesTable.id, feedIntakeId))
      .returning();

    if (!deletedFeedIntake) {
      return NextResponse.json(
        { error: "Feed intake not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Feed intake deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting feed intake:", error);
    return NextResponse.json(
      { error: "Failed to delete feed intake" },
      { status: 500 }
    );
  }
}
