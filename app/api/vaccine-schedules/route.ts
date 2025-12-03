import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vaccineSchedulesTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET all vaccine schedules
export async function GET() {
  try {
    const schedules = await db
      .select()
      .from(vaccineSchedulesTable)
      .orderBy(desc(vaccineSchedulesTable.scheduledDate));

    return NextResponse.json(schedules, { status: 200 });
  } catch (error) {
    console.error("Error fetching vaccine schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch vaccine schedules" },
      { status: 500 }
    );
  }
}

// POST create a new vaccine schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vaccine_name, week_number, scheduled_date, status, description } =
      body;

    // Validate required fields
    if (!vaccine_name || !week_number || !scheduled_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [newSchedule] = await db
      .insert(vaccineSchedulesTable)
      .values({
        vaccineName: vaccine_name,
        weekNumber: week_number,
        scheduledDate: new Date(scheduled_date),
        status: status || "pending",
        description,
      })
      .returning();

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    console.error("Error creating vaccine schedule:", error);
    return NextResponse.json(
      { error: "Failed to create vaccine schedule" },
      { status: 500 }
    );
  }
}
