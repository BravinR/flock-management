import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vaccineSchedulesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET a single vaccine schedule by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scheduleId = parseInt(id);

    if (isNaN(scheduleId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const [schedule] = await db
      .select()
      .from(vaccineSchedulesTable)
      .where(eq(vaccineSchedulesTable.id, scheduleId));

    if (!schedule) {
      return NextResponse.json(
        { error: "Vaccine schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(schedule, { status: 200 });
  } catch (error) {
    console.error("Error fetching vaccine schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch vaccine schedule" },
      { status: 500 }
    );
  }
}

// PUT update a vaccine schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scheduleId = parseInt(id);

    if (isNaN(scheduleId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { vaccineName, weekNumber, scheduledDate, status, description } =
      body;

    const updateData: any = { updatedAt: new Date() };

    if (vaccineName) updateData.vaccineName = vaccineName;
    if (weekNumber) updateData.weekNumber = weekNumber;
    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
    if (status) updateData.status = status;
    if (description !== undefined) updateData.description = description;

    const [updatedSchedule] = await db
      .update(vaccineSchedulesTable)
      .set(updateData)
      .where(eq(vaccineSchedulesTable.id, scheduleId))
      .returning();

    if (!updatedSchedule) {
      return NextResponse.json(
        { error: "Vaccine schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSchedule, { status: 200 });
  } catch (error) {
    console.error("Error updating vaccine schedule:", error);
    return NextResponse.json(
      { error: "Failed to update vaccine schedule" },
      { status: 500 }
    );
  }
}

// DELETE a vaccine schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scheduleId = parseInt(id);

    if (isNaN(scheduleId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const [deletedSchedule] = await db
      .delete(vaccineSchedulesTable)
      .where(eq(vaccineSchedulesTable.id, scheduleId))
      .returning();

    if (!deletedSchedule) {
      return NextResponse.json(
        { error: "Vaccine schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Vaccine schedule deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting vaccine schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete vaccine schedule" },
      { status: 500 }
    );
  }
}
