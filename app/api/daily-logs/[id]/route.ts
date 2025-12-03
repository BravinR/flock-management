import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dailyLogsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET a single daily log by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const logId = parseInt(id);

    if (isNaN(logId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const dailyLog = await db.query.dailyLogsTable.findFirst({
      where: eq(dailyLogsTable.id, logId),
      with: {
        batch: true,
        createdByUser: true,
      },
    });

    if (!dailyLog) {
      return NextResponse.json(
        { error: "Daily log not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(dailyLog, { status: 200 });
  } catch (error) {
    console.error("Error fetching daily log:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily log" },
      { status: 500 }
    );
  }
}

// PUT update a daily log
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const logId = parseInt(id);

    if (isNaN(logId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      batch_id,
      log_date,
      mortality_count,
      feed_type,
      feed_input_mode,
      feed_bags,
      feed_kg,
      water_intake_liters,
      notes,
      logged_by,
    } = body;

    const updateData: any = { updatedAt: new Date() };

    if (batch_id !== undefined) updateData.batchId = batch_id;
    if (log_date) updateData.logDate = new Date(log_date);
    if (mortality_count !== undefined) updateData.mortalityCount = mortality_count;
    if (feed_type) updateData.feedType = feed_type;
    if (feed_input_mode) updateData.feedInputMode = feed_input_mode;
    if (feed_bags !== undefined) updateData.feedBags = feed_bags.toString();
    if (feed_kg !== undefined) updateData.feedKg = feed_kg.toString();
    if (water_intake_liters !== undefined)
      updateData.waterIntakeLiters = water_intake_liters.toString();
    if (notes !== undefined) updateData.notes = notes;
    if (logged_by) updateData.loggedBy = logged_by;

    const [updatedLog] = await db
      .update(dailyLogsTable)
      .set(updateData)
      .where(eq(dailyLogsTable.id, logId))
      .returning();

    if (!updatedLog) {
      return NextResponse.json(
        { error: "Daily log not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedLog, { status: 200 });
  } catch (error) {
    console.error("Error updating daily log:", error);
    return NextResponse.json(
      { error: "Failed to update daily log" },
      { status: 500 }
    );
  }
}

// DELETE a daily log
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const logId = parseInt(id);

    if (isNaN(logId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const [deletedLog] = await db
      .delete(dailyLogsTable)
      .where(eq(dailyLogsTable.id, logId))
      .returning();

    if (!deletedLog) {
      return NextResponse.json(
        { error: "Daily log not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Daily log deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting daily log:", error);
    return NextResponse.json(
      { error: "Failed to delete daily log" },
      { status: 500 }
    );
  }
}
