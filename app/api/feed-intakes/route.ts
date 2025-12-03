import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { feedIntakesTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET all feed intakes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId");

    let query = db.select().from(feedIntakesTable);

    // Filter by supplierId if provided
    if (supplierId) {
      const id = parseInt(supplierId);
      if (!isNaN(id)) {
        query = query.where(eq(feedIntakesTable.supplierId, id)) as any;
      }
    }

    const feedIntakes = await query.orderBy( desc(feedIntakesTable.deliveryDate)); return NextResponse.json(feedIntakes, { status: 200 }); } catch (error) { console.error("Error fetching feed intakes:", error); return NextResponse.json( { error: "Failed to fetch feed intakes" }, { status: 500 }); } } // POST create a new feed intake
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      delivery_date,
      feed_type,
      custom_feed_name,
      supplier_id,
      supplier,
      input_mode,
      bags_received,
      kg_received,
      cost_per_bag,
      cost_per_kg,
      total_cost,
      currency,
      batch_number,
      invoice_number,
      notes,
      received_by,
      created_by,
    } = body;

    // Validate required fields
    if (!delivery_date || !feed_type || !input_mode || !total_cost || !received_by) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [newFeedIntake] = await db
      .insert(feedIntakesTable)
      .values({
        deliveryDate: new Date(delivery_date),
        feedType: feed_type,
        customFeedName: custom_feed_name,
        supplierId: supplier_id,
        supplierName: supplier,
        inputMode: input_mode,
        bagsReceived: bags_received,
        kgReceived: kg_received,
        costPerBag: cost_per_bag,
        costPerKg: cost_per_kg,
        totalCost: total_cost,
        currency: currency || "KES",
        batchNumber: batch_number,
        invoiceNumber: invoice_number,
        notes,
        receivedBy: received_by,
        createdBy: created_by,
      })
      .returning();

    return NextResponse.json(newFeedIntake, { status: 201 });
  } catch (error) {
    console.error("Error creating feed intake:", error);
    return NextResponse.json(
      { error: "Failed to create feed intake" },
      { status: 500 }
    );
  }
}
