import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dailyLogsTable, batchesTable } from "@/db/schema";
import { desc, eq, and, gte, lte } from "drizzle-orm";

// GET all daily logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = db.select().from(dailyLogsTable);
    const conditions: any[] = [];

    // Filter by batchId if provided
    if (batchId) {
      const id = parseInt(batchId);
      if (!isNaN(id)) {
        conditions.push(eq(dailyLogsTable.batchId, id));
      }
    }

    // Filter by date range if provided
    if (startDate) {
      conditions.push(gte(dailyLogsTable.logDate, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(dailyLogsTable.logDate, new Date(endDate)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const dailyLogs = await query.orderBy(desc(dailyLogsTable.logDate));

    return NextResponse.json(dailyLogs, { status: 200 });
  } catch (error) {
    console.error("Error fetching daily logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily logs" },
      { status: 500 }
    );
  }
}

// POST create a new daily log
export async function POST(request: NextRequest) {
  try {
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
      created_by,
    } = body;

    // Validate required fields
    if (
      !log_date ||
      !feed_type ||
      !feed_input_mode ||
      !logged_by ||
      water_intake_liters === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If batch_id is provided, update the current_count based on mortality
    if (batch_id && mortality_count > 0) {
      const [batch] = await db
        .select()
        .from(batchesTable)
        .where(eq(batchesTable.id, batch_id));

      if (batch) {
        const newCurrentCount = batch.currentCount - mortality_count;
        await db
          .update(batchesTable)
          .set({
            currentCount: newCurrentCount,
            updatedAt: new Date(),
          })
          .where(eq(batchesTable.id, batch_id));
      }
    }

    const [newDailyLog] = await db
      .insert(dailyLogsTable)
      .values({
        batchId: batch_id || null,
        logDate: new Date(log_date),
        mortalityCount: mortality_count || 0,
        feedType: feed_type,
        feedInputMode: feed_input_mode,
        feedBags: feed_bags?.toString() || "0",
        feedKg: feed_kg?.toString() || "0",
        waterIntakeLiters: water_intake_liters?.toString() || "0",
        notes: notes || null,
        loggedBy: logged_by,
        createdBy: created_by || null,
      })
      .returning();

    return NextResponse.json(newDailyLog, { status: 201 });
  } catch (error) {
    console.error("Error creating daily log:", error);
    return NextResponse.json(
      { error: "Failed to create daily log", details: (error as Error).message },
      { status: 500 }
    );
  }
}
